const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const { convertToDateTime } = require("../helpers/timePeriod");
const validatePassword = require("../helpers/validatePassword");
const generateAccesToken = require("../helpers/generateAccessToken");
const hashPassword = require("../helpers/hashPassword");
const prisma = new PrismaClient();

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
    let userDetails = await prisma.users.findUnique({
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

exports.signUp = async (req, res) => {
  try {
    let userDetails = req.body;
    const hashedPassword = hashPassword(userDetails.password);
    userDetails.password = hashedPassword;
    let isUserExist = await prisma.users.findFirst({
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
    let result = await prisma.users.create({
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
      success: false,
      err: err,
    });
  }
};

exports.createHospitals = async (req, res) => {
  try {
    let hospitalDetails = req.body;
    let result = await prisma.hospitals.create({
      data: hospitalDetails,
    });
    res.status(httpStatus.OK).send({
      message: "Hospital created successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating hospital",
      success: false,
      err: err,
    });
  }
};

exports.createDoctors = async (req, res) => {
  try {
    let doctorDetails = req.body;
    let result = await prisma.users.create({
      data: doctorDetails,
    });
    res.status(httpStatus.OK).send({
      message: "Doctor created successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating doctor",
      success: false,
      err: err,
    });
  }
};

exports.createWeekDays = async (req, res) => {
  try {
    // let doctorDetails = req.body;
    let result = await prisma.weekdays.createMany({
      data: [
        {
          name: "Monday",
        },
        {
          name: "Tuesday",
        },
        {
          name: "Wednesday",
        },
        {
          name: "Thursday",
        },
        {
          name: "Friday",
        },
        {
          name: "Saturday",
        },
        {
          name: "Sunday",
        },
      ],
    });
    res.status(httpStatus.OK).send({
      message: "weekdays created successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating weekdays",
      success: false,
      err: err,
    });
  }
};

exports.createSlots = async (req, res) => {
  try {
    const interval = parseInt(req.query.interval, 10);
    const { id, hospitalId } = req.user;

    if (!interval || interval <= 0) {
      return res.status(400).json({ error: "Invalid interval" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const slots = [];
    let currentSlotStart = startOfDay;

    while (
      currentSlotStart <
      new Date(
        startOfDay.getFullYear(),
        startOfDay.getMonth(),
        startOfDay.getDate(),
        23,
        59,
      )
    ) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + interval * 60000,
      );
      const startHours = currentSlotStart.getHours();
      const startMinutes = currentSlotStart.getMinutes();
      const endHours = currentSlotEnd.getHours();
      const endMinutes = currentSlotEnd.getMinutes();
      const startAMPM = startHours >= 12 ? "PM" : "AM";
      const endAMPM = endHours >= 12 ? "PM" : "AM";
      const startString = `${String(startHours % 12 || 12).padStart(
        2,
        "0",
      )}:${startMinutes.toString().padStart(2, "0")} ${startAMPM}`;
      const endString = `${String(endHours % 12 || 12).padStart(
        2,
        "0",
      )}:${endMinutes.toString().padStart(2, "0")} ${endAMPM}`;
      let slotStartTimeInDate = convertToDateTime(startString);
      let slotEndTimeInDate = convertToDateTime(endString);
      slots.push({
        startTime: startString,
        endTime: endString,
        hospitalId: hospitalId,
        startTimeInDateTime: slotStartTimeInDate,
        endTimeInDateTime: slotEndTimeInDate,
      });
      currentSlotStart = currentSlotEnd;
    }

    let dbResult = await prisma.slots.createMany({
      data: slots,
    });

    res.status(httpStatus.OK).send({
      message: "slots created successfully",
      success: true,
      data: {
        totalSlots: slots.length,
        dbResult,
        slots,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating slots",
      success: false,
      err: err,
    });
  }
};

exports.createDoctorsSlot = async (req, res) => {
  try {
    let selectedSlots = req.body.selectedSlots;
    let weekDaysId = req.body.weekDaysId;
    let doctorId = req.body.doctorId;

    let formattedPayload = selectedSlots.map((id) => {
      return {
        doctorId,
        slotId: id,
        weekDaysId,
        slotLimit: 0,
      };
    });

    let result = await prisma.doctorSlots.createMany({
      data: formattedPayload,
    });
    res.status(httpStatus.OK).send({
      message: "Doctor slots created successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating doctor slots",
      success: false,
      err: err,
    });
  }
};

exports.createAilment = async (req, res) => {
  try {
    let ailmentDetails = req.body;
    let { hospitalId } = req.user;
    let result = await prisma.ailment.create({
      data: {
        hospitalId,
        ...ailmentDetails,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Ailment created successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating ailment",
      success: false,
      err: err,
    });
  }
};

exports.getAlimentList = async (req, res) => {
  try {
    let { hospitalId } = req.user;
    let result = await prisma.ailment.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
        isDeleted: false,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Ailment list fetched successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching ailment list",
      success: false,
      err: err,
    });
  }
};

exports.updateAilment = async (req, res) => {
  try {
    let ailmentDetails = req.body;
    console.log("updatealiment", ailmentDetails);
    const ailmentId = req.params.ailmentId;
    let result = await prisma.ailment.update({
      where: {
        id: ailmentId,
      },
      data: ailmentDetails,
    });
    res.status(httpStatus.OK).send({
      message: "Ailment updated successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating ailment",
      success: false,
      err: err,
    });
  }
};
exports.deleteAilment = async (req, res) => {
  try {
    const ailmentId = req.params.ailmentId;
    await prisma.ailment.update({
      where: {
        id: ailmentId,
      },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Decease deleted",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error deleting ailment",
      success: true,
      err: err,
    });
  }
};
exports.createdocumentType = async (req, res) => {
  try {
    let docTypeDetails = req.body;
    const { hospitalId } = req.user;
    let result = await prisma.documentTypes.create({
      data: { hospitalId, ...docTypeDetails },
    });
    res.status(httpStatus.OK).send({
      message: "Document type created",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error creating document type",
      success: false,
      err: err,
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    let appointmentId = req.body.appointmentId;
    let prescriptions = req.body.prescriptions;
    let doctorRemarks = req.body.doctorRemarks;
    let status = req.body.status;

    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    let appointUpdateResult = await prisma.appointments.update({
      where: {
        id: appointmentId,
      },
      data: {
        appointmentStatus: status,
        doctorRemarks: doctorRemarks,
      },
    });

    if (prescriptions.length > 0) {
      await Promise.all(
        prescriptions.map((prescription) => {
          return new Promise(async (res, rej) => {
            try {
              let startDate = new Date();
              let endDate = addDays(startDate, prescription.durationInDays);
              let prescriptionDetails = await prisma.patientPrescription.create(
                {
                  data: {
                    medicationStockId: prescription.medicationStockId,
                    durationInDays: prescription.durationInDays,
                    foodRelation: prescription.foodRelation,
                    appointmentId: appointmentId,
                    patientId: appointUpdateResult.patientId,
                    hospitalId: appointUpdateResult.hospitalId,
                  },
                },
              );
              let promiseArr = [];
              for (
                let date = startDate;
                date < endDate;
                date = addDays(date, 1)
              ) {
                promiseArr.push(
                  new Promise(async (res, rej) => {
                    try {
                      let prescriptionDayTimeData = [];
                      let prescriptionDayData =
                        await prisma.prescriptionDays.create({
                          data: {
                            prescriptionId: prescriptionDetails.id,
                            prescriptionDate: new Date(
                              date.setHours(0, 0, 0, 0),
                            ),
                          },
                        });
                      for (const timeOfDay of prescription.timeOfDay) {
                        prescriptionDayTimeData.push({
                          timeOfDay,
                          prescriptionDayId: prescriptionDayData.id,
                        });
                      }
                      await prisma.prescriptionTimeOfDay.createMany({
                        data: prescriptionDayTimeData,
                      });
                      res("success");
                    } catch (err) {
                      console.log("err", err);
                      rej(err);
                    }
                  }),
                );
              }
              await Promise.allSettled(promiseArr);
              res("success");
            } catch (err) {
              console.log("errrrr", err);
              rej(err);
            }
          });
        }),
      );
    }
    res.status(httpStatus.OK).send({
      message: "Appointment status updated successfully",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error updating appointment status",
      success: false,
      err: err,
    });
  }
};

exports.createMedication = async (req, res) => {
  try {
    const medicationDetails = req.body;
    const { hospitalId } = req.user;
    const response = await prisma.medicationStocks.create({
      data: { hospitalId, ...medicationDetails },
    });

    res.status(httpStatus.OK).send({
      message: "Medication created",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error creating medication",
      success: false,
      err: err,
    });
  }
};

exports.getMedicationList = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const response = await prisma.medicationStocks.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
        isDeleted: false,
      },
    });

    res.status(httpStatus.OK).send({
      message: "Medication list fetched",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching medication list",
      success: false,
      err: err,
    });
  }
};

exports.updateMedicationDetails = async (req, res) => {
  try {
    const medicationDetails = req.body;
    const medicationId = req.params.medicationId;
    const response = await prisma.medicationStocks.update({
      where: {
        id: medicationId,
      },
      data: { ...medicationDetails },
    });

    res.status(httpStatus.OK).send({
      message: "Medication details updated",
      success: true,
      data: response,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating medication details",
      success: false,
      err: err,
    });
  }
};

exports.deleteMedication = async (req, res) => {
  try {
    const medicationId = req.params.medicationId;
    await prisma.medicationStocks.update({
      where: {
        id: medicationId,
      },
      data: { isActive: false, isDeleted: true },
    });

    res.status(httpStatus.OK).send({
      message: "Medication deleted",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error deleting medication",
      success: false,
      err: err,
    });
  }
};
