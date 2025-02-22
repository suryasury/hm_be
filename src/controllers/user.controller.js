const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const hashPassword = require("../helpers/hashPassword");
const validatePassword = require("../helpers/validatePassword");
const generateAccesToken = require("../helpers/generateAccessToken");
const {
  determineTimePeriod,
  getStartAndEndOfDay,
  convertDateToWeekdayMonthDayYear,
} = require("../helpers/timePeriod");
const {
  getPreSignedUrl,
  // deleteDocumentFromS3,
} = require("./common.controller");
const prisma = new PrismaClient();
const fs = require("fs");
const emailService = require("../utils/emailService");
const decryptPassword = require("../helpers/decryptPassword");

exports.signUp = async (req, res) => {
  try {
    let userDetails = req.body;
    const decryptedPassword = decryptPassword(userDetails.password);
    const hashedPassword = hashPassword(decryptedPassword);
    userDetails.password = hashedPassword;
    let isUserExist = await prisma.patients.findFirst({
      where: {
        OR: [
          {
            phoneNumber: userDetails.phoneNumber,
          },
          {
            email: userDetails.email,
          },
        ],
      },
    });
    if (isUserExist) {
      return res.status(httpStatus.CONFLICT).send({
        message: "User already exist with given mobile number or email",
        success: false,
        data: {},
      });
    }
    let result = await prisma.patients.create({
      data: userDetails,
    });
    const jwtToken = generateAccesToken({
      userId: result.id,
    });
    res.cookie("sessionToken", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(httpStatus.OK).send({
      message: "User created successfully",
      success: true,
      data: {
        userDetails: result,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating hospital",
      success: true,
      err: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    let loginDetails = req.body;
    let whereClause = {};
    if (loginDetails.userNameType === "EMAIL") {
      whereClause = {
        email: loginDetails.userName,
      };
    } else {
      whereClause = {
        phoneNumber: loginDetails.userName,
      };
    }
    let userDetails = await prisma.patients.findUnique({
      where: whereClause,
    });
    if (userDetails) {
      const decryptedPassword = decryptPassword(loginDetails.password);
      const isValidPassword = validatePassword(
        decryptedPassword,
        userDetails.password,
      );
      if (isValidPassword) {
        const jwtToken = generateAccesToken({
          userId: userDetails.id,
        });
        res.cookie("sessionToken", jwtToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        return res.status(httpStatus.OK).send({
          message: "User Logged in successfully",
          success: true,
          data: {},
        });
      } else {
        return res.status(httpStatus.FORBIDDEN).send({
          message: "Invalid user name or password",
          success: false,
          data: {},
        });
      }
    }
    res.status(httpStatus.FORBIDDEN).send({
      message: "User not found. Please signup",
      success: false,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error on login",
      success: false,
      err: err,
    });
  }
};

exports.forgotPasswordEmailRequest = async (req, res) => {
  try {
    let email = req.body.email;
    let userDetails = await prisma.patients.findFirst({
      where: {
        email: email,
      },
    });
    if (!userDetails) {
      return res.status(httpStatus.NOT_FOUND).send({
        message: "Invalid email or email not found",
        success: false,
        data: {},
      });
    }
    let template = fs.readFileSync(
      "src/emailTemplates/forgotPassword.html",
      "utf-8",
    );
    let token = generateAccesToken(
      {
        userId: userDetails.id,
      },
      "30m",
    );
    let html = template
      .replace("{{name}}", userDetails.name)
      .replace(
        /{{resetLink}}/g,
        process.env.FRONTEND_URL_PATIENT +
          process.env.RESET_PASSWORD_FRONTEND_ROUTE_PATIENT +
          token,
      );
    await emailService.sendEmail({
      from: process.env.SMTP_EMAIL,
      to: userDetails.email,
      subject: "Reset Password",
      html: html,
    });
    res.status(httpStatus.OK).send({
      message:
        "Reset password link has been sent to your email. Kindly check the email and proceed further",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error sending email. Please try again after sometime",
      success: false,
      error: err,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const userDetails = req.user;
    const { password } = req.body;
    const decryptedPassword = decryptPassword(password);
    const hashedPassword = hashPassword(decryptedPassword);
    await prisma.patients.update({
      data: {
        password: hashedPassword,
      },
      where: {
        id: userDetails.id,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Password changed successfully. Please login again",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: err.message,
      success: false,
      error: err,
    });
  }
};

exports.userDetails = async (req, res) => {
  try {
    let userDetails = req.user;
    if (userDetails.profilePictureUrl) {
      const preSignedUrl = await getPreSignedUrl(userDetails.profilePictureUrl);
      userDetails.signedUrl = preSignedUrl;
    }
    res.status(httpStatus.OK).send({
      message: "User details fetched successfully",
      success: true,
      data: userDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching user details",
      success: false,
      err: err,
    });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    let userDetails = req.body;
    let { id } = req.user;
    if (userDetails.email || userDetails.phoneNumber) {
      let isUserExist = await prisma.patients.findFirst({
        where: {
          OR: [
            {
              email: userDetails.email,
            },
            {
              phoneNumber: userDetails.phoneNumber,
            },
          ],
        },
      });
      if (isUserExist) {
        return res.status(httpStatus.CONFLICT).send({
          message: "Email or phone number already exists",
          success: false,
          data: {},
        });
      }
    }
    let updatedUserDetails = await prisma.patients.update({
      where: {
        id,
      },
      data: userDetails,
    });
    res.status(httpStatus.OK).send({
      message: "Profile updated",
      success: true,
      data: updatedUserDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating profile",
      success: false,
      err: err,
    });
  }
};

exports.doctorList = async (req, res) => {
  try {
    let doctorList = await prisma.users.findMany({
      where: {
        role: "DOCTOR",
      },
    });
    res.status(httpStatus.OK).send({
      message: "User details fetched successfully",
      success: true,
      data: {
        doctorList,
        meta: {},
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching user details",
      success: false,
      err: err,
    });
  }
};

exports.getWeekDaysList = async (req, res) => {
  try {
    let weekDayList = await prisma.weekdays.findMany();
    res.status(httpStatus.OK).send({
      message: "Week days fetched successfully",
      success: true,
      data: weekDayList,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching user details",
      success: false,
      err: err,
    });
  }
};

exports.doctorSlotDetails = async (req, res) => {
  try {
    let doctorId = req.params.doctorId;
    let weekDayId = req.params.weekDayId;
    let doctorSlotDetails = await prisma.doctorSlots.findMany({
      where: {
        doctorId: doctorId,
        weekDaysId: weekDayId,
        slot: {
          isActive: true,
          isDeleted: false,
        },
      },
      include: {
        slot: true,
      },
      orderBy: [
        {
          slot: {
            startTimeInDateTime: "asc",
          },
        },
        {
          slot: {
            endTimeInDateTime: "asc",
          },
        },
      ],
    });
    let morningSlots = [];
    let afternoonSlots = [];
    let eveningSlots = [];
    let isDoctorAvailableForTheDay = true;

    doctorSlotDetails.forEach((slotDetails) => {
      if (isDoctorAvailableForTheDay) {
        isDoctorAvailableForTheDay = slotDetails.isDoctorAvailableForTheDay;
      }
      if (determineTimePeriod(slotDetails.slot.startTime) === "morning") {
        morningSlots.push(slotDetails);
      } else if (
        determineTimePeriod(slotDetails.slot.startTime) === "afternoon"
      ) {
        afternoonSlots.push(slotDetails);
      } else {
        eveningSlots.push(slotDetails);
      }
    });
    res.status(httpStatus.OK).send({
      message: "Doctors slot for the day fetched successfully",
      success: true,
      data: {
        isSlotAvailableForTheDay:
          doctorSlotDetails.length > 0 && isDoctorAvailableForTheDay,
        slotDetails: {
          morningSlots,
          afternoonSlots,
          eveningSlots,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching dctors slot details",
      success: false,
      err: err,
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    let appointmentDetails = req.body;
    let documents = appointmentDetails.documents || [];
    delete appointmentDetails.documents;
    let { id } = req.user;
    const { startDate } = getStartAndEndOfDay(
      appointmentDetails.appointmentDate,
    );

    //will do concurrency control later
    const isTokenExists = await prisma.tokenNumberTrackers.findUnique({
      where: {
        doctorSlotDateHospitalUniqueIdentifier: {
          date: startDate,
          doctorSlotId: appointmentDetails.doctorSlotId,
          hospitalId: appointmentDetails.hospitalId,
        },
      },
    });

    let updatedTokenRecord = {};

    if (isTokenExists) {
      updatedTokenRecord = await prisma.tokenNumberTrackers.update({
        where: {
          id: isTokenExists.id,
        },
        data: {
          currentValue: {
            increment: 1,
          },
        },
      });
    } else {
      updatedTokenRecord = await prisma.tokenNumberTrackers.create({
        data: {
          date: startDate,
          hospitalId: appointmentDetails.hospitalId,
          doctorSlotId: appointmentDetails.doctorSlotId,
          currentValue: 1,
        },
      });
    }
    let tokenNumber = updatedTokenRecord.currentValue;
    tokenNumber = tokenNumber.toString().padStart(4, "0");
    let newAppointment = await prisma.appointments.create({
      data: {
        appointmentStatus: "SCHEDULED",
        bookedBy: "PATIENT",
        patientId: id,
        tokenNumber: tokenNumber,
        ...appointmentDetails,
        appointmentDate: startDate,
      },
      select: {
        patient: true,
        doctor: true,
        doctorSlots: {
          select: {
            slot: true,
          },
        },
        hospital: true,
        id: true,
        hospitalId: true,
        appointmentDate: true,
      },
    });
    if (documents.length > 0) {
      const documentsData = documents.map((document) => {
        return {
          fileName: document.fileName,
          bucketPath: document.bucketPath,
          documentName: document.fileName,
          fileExtension: document.fileExtension,
          contentType: document.contentType,
          patientId: id,
          appointmentId: newAppointment.id,
          documentTypeId: document.documentTypeId,
        };
      });
      await prisma.patientAppointmentDocs.createMany({
        data: documentsData,
      });
    }
    let hospitalPatient = await prisma.hospitalPatients.findFirst({
      where: {
        hospitalId: newAppointment.hospitalId,
        patientId: id,
      },
    });
    if (!hospitalPatient) {
      await prisma.hospitalPatients.create({
        data: {
          hospitalId: newAppointment.hospitalId,
          patientId: id,
        },
      });
    }
    const formattedDate = convertDateToWeekdayMonthDayYear(
      newAppointment.appointmentDate,
    );
    canSendEmail = true;
    let template = fs.readFileSync(
      "src/emailTemplates/appointmentScheduled.html",
      "utf-8",
    );
    html = template
      .replace("{{name}}", newAppointment.patient.name)
      .replace("{{appointmentDate}}", formattedDate)
      .replace("{{appointmentTime}}", newAppointment.doctorSlots.slot.startTime)
      .replace("{{doctorName}}", newAppointment.doctor.name)
      .replace(
        "{{doctorQualification}}",
        newAppointment.doctor.qualification
          ? ` ${newAppointment.doctor.qualification}`
          : "",
      )
      .replace(
        "{{doctorSpeciality}}",
        newAppointment.doctor.speciality
          ? `(${newAppointment.doctor.speciality})`
          : "",
      )
      .replace("{{tokenNumber}}", tokenNumber)
      .replace("{{hospitalName}}", newAppointment.hospital.name);

    await emailService.sendEmail({
      from: process.env.SMTP_EMAIL,
      to: newAppointment.patient.email,
      subject: "Appointment Scheduled",
      html: html,
    });
    res.status(httpStatus.OK).send({
      message: "Appointment booked successfully",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error creating appointment",
      success: false,
      err: err,
    });
  }
};

exports.getAppointmentList = async (req, res) => {
  try {
    let { id } = req.user;
    let appointmentList = await prisma.appointments.findMany({
      where: {
        appointmentStatus: {
          in: ["APPROVED", "SCHEDULED", "PENDING"],
        },
        patientId: id,
      },
      include: {
        doctor: true,
        doctorSlots: {
          include: {
            slot: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        // {
        //   doctorSlots: {
        //     slot: {
        //       startTimeInDateTime: "asc",
        //     },
        //   },
        // },
      ],
    });
    res.status(httpStatus.OK).send({
      message: "Appointment list fetched successfully",
      success: true,
      data: {
        appointmentList,
        meta: {},
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching appointment list",
      success: false,
      err: err,
    });
  }
};

exports.getAppointmentHistoryList = async (req, res) => {
  try {
    let { id } = req.user;
    let appointmentList = await prisma.appointments.findMany({
      where: {
        appointmentStatus: { in: ["COMPLETED", "CANCELLED"] },
        patientId: id,
      },
      include: {
        doctor: true,
        doctorSlots: {
          include: {
            slot: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        // {
        //   doctorSlots: {
        //     slot: {
        //       startTimeInDateTime: "asc",
        //     },
        //   },
        // },
      ],
    });
    res.status(httpStatus.OK).send({
      message: "Appointment history list fetched successfully",
      success: true,
      data: {
        appointmentList,
        meta: {},
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching appointment history list",
      success: false,
      err: err,
    });
  }
};

exports.getAppointmentDetails = async (req, res) => {
  try {
    let { appointmentId } = req.params;
    let appointmentDetails = await prisma.appointments.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        appointmentFeedbacks: true,
        doctor: true,
        doctorSlots: {
          include: {
            slot: true,
          },
        },
        patientAppointmentDocs: {
          include: {
            documentTypes: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        ailment: {
          select: {
            id: true,
            name: true,
          },
        },
        postTreatmentDocuments: {
          select: {
            id: true,
            bucketPath: true,
            documentName: true,
            fileExtension: true,
            fileName: true,
            documentTypes: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        patientPrescription: {
          include: {
            medicationStock: {
              select: {
                id: true,
                medicationName: true,
                medicationDosage: true,
                description: true,
              },
            },
            // prescriptionDays: {
            //   include: {
            //     prescriptionTimeOfDay: true,
            //   },
            // },
          },
        },
      },
    });
    if (appointmentDetails.patientAppointmentDocs.length > 0) {
      let signedUrlPromise = appointmentDetails.patientAppointmentDocs.map(
        async (patientDocs) => {
          const signedUrl = await getPreSignedUrl(patientDocs.bucketPath);
          return {
            ...patientDocs,
            signedUrl,
          };
        },
      );
      appointmentDetails.patientAppointmentDocs = await Promise.all(
        signedUrlPromise,
      );
    }
    if (appointmentDetails.postTreatmentDocuments.length > 0) {
      let signedUrlPromise = appointmentDetails.postTreatmentDocuments.map(
        async (patientDocs) => {
          const signedUrl = await getPreSignedUrl(patientDocs.bucketPath);
          return {
            ...patientDocs,
            signedUrl,
          };
        },
      );
      appointmentDetails.postTreatmentDocuments = await Promise.all(
        signedUrlPromise,
      );
    }
    res.status(httpStatus.OK).send({
      message: "Appointment details fetched successfully",
      success: true,
      data: appointmentDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching appointment details",
      success: false,
      err: err,
    });
  }
};

exports.updateAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { id } = req.user;
    let appointmentDetails = req.body.appointmentDetails;
    const removedDocsArray = req.body.removedDocuments || [];
    const documents = req.body.documents || {};
    if (appointmentDetails && Object.keys(appointmentDetails).length > 0) {
      if (appointmentDetails.appointmentDate) {
        const { startDate } = getStartAndEndOfDay(
          appointmentDetails.appointmentDate,
        );
        appointmentDetails.appointmentDate = startDate;
      }
      await prisma.appointments.update({
        where: {
          id: appointmentId,
        },
        data: appointmentDetails,
      });
    }

    if (removedDocsArray.length > 0) {
      await Promise.all(
        removedDocsArray.map(async (removedDoc) => {
          try {
            await Promise.all([
              await prisma.patientAppointmentDocs.delete({
                where: {
                  id: removedDoc.id,
                },
              }),
              // await deleteDocumentFromS3(removedDoc.bucketPath),
            ]);
          } catch (err) {
            throw err;
          }
        }),
      );
    }
    if (documents.length > 0) {
      const documentsData = documents.map((document) => {
        return {
          fileName: document.fileName,
          bucketPath: document.bucketPath,
          documentName: document.fileName,
          fileExtension: document.fileExtension,
          contentType: document.contentType,
          patientId: id,
          appointmentId: appointmentId,
          documentTypeId: document.documentTypeId,
        };
      });
      await prisma.patientAppointmentDocs.createMany({
        data: documentsData,
      });
    }
    res.status(httpStatus.OK).send({
      message: "Appointment updated",
      success: true,
      data: appointmentDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating appointment details",
      success: false,
      err: err,
    });
  }
};

exports.getPrescriptionDetails = async (req, res) => {
  try {
    let date = req.query.date;
    let { id } = req.user;
    let prescriptionList = await prisma.patientPrescription.findMany({
      where: {
        patientId: id,
      },
      include: {
        medicationStock: true,
        prescriptionDays: {
          where: {
            prescriptionDate: new Date(date),
          },
          include: {
            prescriptionTimeOfDay: true,
          },
        },
      },
    });
    let morningPrescription = [];
    let afterNoonPrescription = [];
    let eveningPrescription = [];
    let nightPrescription = [];
    let isPriscriptionAvailableForTheDay = false;
    prescriptionList.forEach((prescription) => {
      prescription.prescriptionDays.forEach((pDays) => {
        pDays.prescriptionTimeOfDay.forEach((pTimeOfDay) => {
          isPriscriptionAvailableForTheDay = true;
          let prescriptionResult = {
            prescriptionId: prescription.id,
            appointmentId: prescription.appointmentId,
            hospitalId: prescription.hospitalId,
            patientId: prescription.patientId,
            medicationName: prescription.medicationStock.medicationName,
            medicationDosage: prescription.medicationStock.medicationDosage,
            foodRelation: prescription.foodRelation,
            prescriptionDate: pDays.prescriptionDate,
            prescriptionDayId: pDays.id,
            prescriptionTimeOfDayId: pTimeOfDay.id,
            isPrescriptionTakenForTheDay: pDays.isPrescriptionTakenForTheDay,
            prescriptionTimeOfDay: pTimeOfDay.timeOfDay,
            isPrescriptionTaken: pTimeOfDay.isPrescriptionTaken,
            prescriptionStockId: prescription.prescriptionStockId,
            prescriptionRemarks: prescription.prescriptionRemarks,
          };
          if (pTimeOfDay.timeOfDay === "MORNING") {
            morningPrescription.push(prescriptionResult);
          } else if (pTimeOfDay.timeOfDay === "AFTERNOON") {
            afterNoonPrescription.push(prescriptionResult);
          } else if (pTimeOfDay.timeOfDay === "EVENING") {
            eveningPrescription.push(prescriptionResult);
          } else if (pTimeOfDay.timeOfDay === "NIGHT") {
            nightPrescription.push(prescriptionResult);
          }
        });
      });
    });
    res.status(httpStatus.OK).send({
      message: "Prescription details fetched successfully",
      success: true,
      data: {
        isPriscriptionAvailableForTheDay,
        morningPrescription,
        afterNoonPrescription,
        eveningPrescription,
        nightPrescription,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching Prescription details",
      success: false,
      err: err,
    });
  }
};

exports.updatePatientPrescriptionStatus = async (req, res) => {
  try {
    let { prescriptionTimeOfDayId, prescriptionDayId } = req.body;
    await prisma.prescriptionTimeOfDay.update({
      where: {
        id: prescriptionTimeOfDayId,
      },
      data: {
        isPrescriptionTaken: req.body.isPrescriptionTaken,
      },
    });
    let allPdetails = await prisma.prescriptionTimeOfDay.findMany({
      where: {
        prescriptionDayId: prescriptionDayId,
      },
    });
    let isTakenForTheDay = true;
    allPdetails.forEach((pTimeOFDaysDetails) => {
      if (!pTimeOFDaysDetails.isPrescriptionTaken) {
        isTakenForTheDay = false;
      }
    });
    if (isTakenForTheDay) {
      await prisma.prescriptionDays.update({
        where: {
          id: prescriptionDayId,
        },
        data: {
          isPrescriptionTakenForTheDay: true,
        },
      });
    }
    res.status(httpStatus.OK).send({
      message: "Medication status updated",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating medication status",
      success: false,
      err: err,
    });
  }
};

exports.createFeedbackForAppointment = async (req, res) => {
  try {
    const feedbackDetails = req.body;
    let { id } = req.user;
    const response = await prisma.appointmentFeedbacks.create({
      data: {
        patientId: id,
        ...feedbackDetails,
      },
    });
    await prisma.appointments.update({
      where: {
        id: feedbackDetails.appointmentId,
      },
      data: {
        isFeedbackProvided: true,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Thanks for the feedback",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error creating feedback",
      success: false,
      err: err,
    });
  }
};

exports.updateFeedbackForAppointment = async (req, res) => {
  try {
    const feedbackDetails = req.body;
    const feedbackId = req.params.feedbackId;
    const response = await prisma.appointmentFeedbacks.update({
      where: {
        id: feedbackId,
      },
      data: {
        ...feedbackDetails,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Feedback updated",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating feedback",
      success: false,
      err: err,
    });
  }
};

exports.getAilmentList = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;
    const response = await prisma.ailment.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
        isDeleted: false,
      },
      select: {
        name: true,
        id: true,
      },
      orderBy: {
        isDefault: "asc",
      },
    });
    res.status(httpStatus.OK).send({
      message: "Ailment list fetched",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching ailment",
      success: false,
      err: err,
    });
  }
};

exports.getDocumentTypes = async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;
    const response = await prisma.documentTypes.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
        isDeleted: false,
      },
      select: {
        name: true,
        id: true,
      },
      orderBy: {
        isDefault: "asc",
      },
    });
    res.status(httpStatus.OK).send({
      message: "Document type list fetched",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching document types",
      success: false,
      err: err,
    });
  }
};

exports.deletePostTreatmentDocuments = async (req, res) => {
  try {
    const { documentId, appointmentId } = req.params;

    await prisma.postTreatmentDocuments.delete({
      where: {
        id: documentId,
      },
    });

    const postTreatmentRecords = await prisma.postTreatmentDocuments.count({
      where: {
        appointmentId: appointmentId,
      },
    });

    if (postTreatmentRecords === 0) {
      await prisma.appointments.update({
        where: {
          id: appointmentId,
        },
        data: {
          isPostTreatmentReportsUploaded: false,
        },
      });
    }

    res.status(httpStatus.OK).send({
      message: "Document deleted successfully",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error deleting document",
      success: false,
      err: err,
    });
  }
};
