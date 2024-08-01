const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const hashPassword = require("../helpers/hashPassword");
const validatePassword = require("../helpers/validatePassword");
const generateAccesToken = require("../helpers/generateAccessToken");
const determineTimePeriod = require("../helpers/timePeriod");
const prisma = new PrismaClient();

exports.signUp = async (req, res) => {
  try {
    console.log("signup controller");
    let userDetails = req.body;
    const hashedPassword = hashPassword(userDetails.password);
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
    console.log("login controller");
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
      const isValidPassword = validatePassword(
        loginDetails.password,
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
        return res.status(httpStatus.UNAUTHORIZED).send({
          message: "Invalid user name or password",
          success: false,
          data: {},
        });
      }
    }
    res.status(httpStatus.UNAUTHORIZED).send({
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

exports.userDetails = async (req, res) => {
  try {
    res.status(httpStatus.OK).send({
      message: "User details fetched successfully",
      success: true,
      data: req.user,
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
      },
      include: {
        slot: true,
      },
    });
    let morningSlots = [];
    let afternoonSlots = [];
    let eveningSlots = [];

    doctorSlotDetails.forEach((slotDetails) => {
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
        isSlotAvailableForTheDay: doctorSlotDetails.length > 0,
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
    let { id } = req.user;
    let newAppointment = await prisma.appointments.create({
      data: {
        appointmentStatus: "SCHEDULED",
        patientId: id,
        ...appointmentDetails,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Appointment booked successfully",
      success: true,
      data: newAppointment,
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

exports.getAppointmentList = async (req, res) => {
  try {
    let { id } = req.user;
    let appointmentList = await prisma.appointments.findMany({
      where: {
        appointmentStatus: "SCHEDULED",
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
          appointmentDate: "asc",
        },
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
        appointmentStatus: { not: "SCHEDULED" },
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
          appointmentDate: "asc",
        },
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
    let appointmentList = await prisma.appointments.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        doctor: true,
        doctorSlots: {
          include: {
            slot: true,
          },
        },
      },
    });
    res.status(httpStatus.OK).send({
      message: "Appointment details fetched successfully",
      success: true,
      data: appointmentList,
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

exports.getPrescriptionDetails = async (req, res) => {
  try {
    let date = req.query.date;
    let { userId } = req.user;
    let prescriptionList = await prisma.patientPrescription.findMany({
      where: {
        patientId: userId,
      },
      include: {
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
    prescriptionList.forEach((prescription) => {
      prescription.prescriptionDays.forEach((pDays) => {
        pDays.prescriptionTimeOfDay.forEach((pTimeOfDay) => {
          let prescriptionResult = {
            prescriptionId: prescription.id,
            appointmentId: prescription.appointmentId,
            hospitalId: prescription.hospitalId,
            patientId: prescription.patientId,
            medicationName: prescription.medicationName,
            medicationDosage: prescription.medicationDosage,
            foodRelation: prescription.foodRelation,
            prescriptionDate: pDays.prescriptionDate,
            isPrescriptionTakenForTheDay: pDays.isPrescriptionTakenForTheDay,
            prescriptionTimeOfDay: pTimeOfDay.timeOfDay,
            isPrescriptionTaken: pTimeOfDay.isPrescriptionTaken,
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
