const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const {
  convertToDateTime,
  getStartAndEndOfDay,
  determineTimePeriod,
} = require("../helpers/timePeriod");
const validatePassword = require("../helpers/validatePassword");
const generateAccesToken = require("../helpers/generateAccessToken");
const hashPassword = require("../helpers/hashPassword");
const { getPreSignedUrl } = require("./common.controller");
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
    const doctorDetails = req.body.doctorDetails || {};
    const slotDetails = req.body.slotDetails || [];
    const { hospitalId } = req.user;
    const hashedPassword = hashPassword("Password@123");
    const isUserExist = await prisma.users.findFirst({
      where: {
        role: "DOCTOR",
        OR: [
          {
            email: doctorDetails.email,
          },
          {
            phoneNumber: doctorDetails.phoneNumber,
          },
        ],
      },
    });
    if (isUserExist) {
      return res.status(httpStatus.CONFLICT).send({
        message: "Doctor already exists with given mobile number or email",
        success: true,
        data: {},
      });
    }
    let newDoctorDetails = await prisma.users.create({
      data: {
        hospitalId: hospitalId,
        isAdmin: false,
        password: hashedPassword,
        ...doctorDetails,
      },
    });

    if (slotDetails.length > 0) {
      let slotsArray = [];
      slotDetails.map((slot) => {
        slot.selectedSlots.map((id) => {
          slotsArray.push({
            doctorId: newDoctorDetails.id,
            slotId: id,
            weekDaysId: slot.weekDaysId,
            slotLimit: 0,
            isDoctorAvailableForTheDay: slot.isDoctorAvailableForTheDay,
          });
        });
      });
      await prisma.doctorSlots.createMany({
        data: slotsArray,
      });
    }
    res.status(httpStatus.OK).send({
      message: "Doctor created successfully",
      success: true,
      data: {},
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

exports.getDoctorDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;
    let userDetails = await prisma.users.findUnique({
      where: {
        id: doctorId,
      },
      select: {
        id: true,
        name: true,
        speciality: true,
        profilePictureUrl: true,
        isAdmin: true,
        email: true,
        houseNumber: true,
        address1: true,
        address2: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        isd_code: true,
        role: true,
        hospitalId: true,
      },
    });
    if (userDetails.profilePictureUrl) {
      userDetails.signedUrl = await getPreSignedUrl(
        userDetails.profilePictureUrl,
      );
    }
    res.status(httpStatus.OK).send({
      message: "Doctor details fetched",
      success: true,
      data: userDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching doctor details",
      success: false,
      err: err,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    let userDetails = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        profilePictureUrl: true,
        isAdmin: true,
        email: true,
        houseNumber: true,
        address1: true,
        address2: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        isd_code: true,
        role: true,
        hospitalId: true,
      },
    });
    if (userDetails.profilePictureUrl) {
      userDetails.signedUrl = await getPreSignedUrl(
        userDetails.profilePictureUrl,
      );
    }
    res.status(httpStatus.OK).send({
      message: "User details fetched",
      success: true,
      data: userDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching user details",
      success: false,
      err: err,
    });
  }
};
exports.createAdmin = async (req, res) => {
  try {
    const adminDetails = req.body;
    const { hospitalId } = req.user;
    const hashedPassword = hashPassword("Password@123");
    const isUserExist = await prisma.users.findFirst({
      where: {
        role: "ADMIN",
        OR: [
          {
            email: adminDetails.email,
          },
          {
            phoneNumber: adminDetails.phoneNumber,
          },
        ],
      },
    });
    if (isUserExist) {
      return res.status(httpStatus.CONFLICT).send({
        message: "User already exists with given mobile number or email",
        success: true,
        data: {},
      });
    }
    const result = await prisma.users.create({
      data: {
        hospitalId: hospitalId,
        isAdmin: true,
        password: hashedPassword,
        ...adminDetails,
      },
    });
    res.status(httpStatus.OK).send({
      message: "User created successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error creating users",
      success: false,
      err: err,
    });
  }
};

exports.getAdminList = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const searchQuery = req.query.search || "";
    const skip = limit * (page - 1);
    let whereClause = {
      hospitalId: hospitalId,
      isAdmin: true,
      isActive: true,
      isDeleted: false,
    };
    if (searchQuery) {
      whereClause.OR = [
        {
          name: {
            contains: searchQuery,
          },
        },
        {
          email: {
            contains: searchQuery,
          },
        },
        {
          phoneNumber: {
            contains: searchQuery,
          },
        },
      ];
    }
    const [result, count] = await prisma.$transaction([
      prisma.users.findMany({
        where: whereClause,
        select: {
          id: 1,
          name: 1,
          email: 1,
          phoneNumber: 1,
          isd_code: 1,
          isAdmin: 1,
          role: 1,
          createdAt: 1,
        },
        skip,
        take: limit,
      }),
      prisma.users.count({
        where: whereClause,
      }),
    ]);

    res.status(httpStatus.OK).send({
      message: "User list fetched",
      success: true,
      data: {
        userList: result,
        meta: {
          totalMatchingRecords: count,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching users list",
      success: false,
      err: err,
    });
  }
};

exports.getDoctorsList = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const searchQuery = req.query.search || "";
    const skip = limit * (page - 1);
    let whereClause = {
      hospitalId: hospitalId,
      isAdmin: false,
      role: "DOCTOR",
      isActive: true,
      isDeleted: false,
    };
    if (searchQuery) {
      whereClause.OR = [
        {
          name: {
            contains: searchQuery,
          },
        },
        {
          email: {
            contains: searchQuery,
          },
        },
        {
          phoneNumber: {
            contains: searchQuery,
          },
        },
      ];
    }
    const [result, count] = await prisma.$transaction([
      prisma.users.findMany({
        where: whereClause,
        select: {
          id: 1,
          name: 1,
          email: 1,
          phoneNumber: 1,
          isd_code: 1,
          isAdmin: 1,
          role: 1,
          createdAt: 1,
          speciality: 1,
        },
        skip,
        take: limit,
      }),
      prisma.users.count({
        where: whereClause,
      }),
    ]);

    res.status(httpStatus.OK).send({
      message: "Doctor list fetched",
      success: true,
      data: {
        doctorList: result,
        meta: {
          totalMatchingRecords: count,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching doctor list",
      success: false,
      err: err,
    });
  }
};

exports.updateAdminDetails = async (req, res) => {
  try {
    const adminDetails = req.body;
    const { userId } = req.params;
    const isUserExist = await prisma.users.findFirst({
      where: {
        role: "ADMIN",
        OR: [
          {
            email: adminDetails.email,
          },
          {
            phoneNumber: adminDetails.phoneNumber,
          },
        ],
      },
    });
    if (
      isUserExist &&
      adminDetails.email &&
      isUserExist.email === adminDetails.email
    ) {
      return res.status(httpStatus.CONFLICT).send({
        message: "User already exists with given email",
        success: true,
        data: {},
      });
    }
    if (
      isUserExist &&
      adminDetails.phoneNumber &&
      isUserExist.phoneNumber === adminDetails.phoneNumber
    ) {
      return res.status(httpStatus.CONFLICT).send({
        message: "User already exists with given phone number",
        success: true,
        data: {},
      });
    }
    await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        ...adminDetails,
      },
    });
    res.status(httpStatus.OK).send({
      message: "User details updated successfully",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error updating user details",
      success: false,
      err: err,
    });
  }
};

exports.updateDoctorDetails = async (req, res) => {
  try {
    const doctorDetails = req.body;
    const { doctorId } = req.params;
    const isUserExist = await prisma.users.findFirst({
      where: {
        role: "DOCTOR",
        OR: [
          {
            email: doctorDetails.email,
          },
          {
            phoneNumber: doctorDetails.phoneNumber,
          },
        ],
      },
    });
    if (
      isUserExist &&
      doctorDetails.email &&
      isUserExist.email === doctorDetails.email
    ) {
      return res.status(httpStatus.CONFLICT).send({
        message: "Doctor already exists with given email",
        success: true,
        data: {},
      });
    }
    if (
      isUserExist &&
      doctorDetails.phoneNumber &&
      isUserExist.phoneNumber === doctorDetails.phoneNumber
    ) {
      return res.status(httpStatus.CONFLICT).send({
        message: "Doctor already exists with given phone number",
        success: true,
        data: {},
      });
    }
    await prisma.users.update({
      where: {
        id: doctorId,
      },
      data: {
        ...doctorDetails,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Doctor details updated successfully",
      success: true,
      data: {},
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error updating doctor details",
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

exports.getWeekDaysList = async (req, res) => {
  try {
    let result = await prisma.weekdays.findMany({});
    res.status(httpStatus.OK).send({
      message: "weekdays list fetched successfully",
      success: true,
      data: {
        weekDayList: result,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching weekdays list",
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

exports.getSlotList = async (req, res) => {
  try {
    const { doctorId, weekDayId } = req.query;
    const { hospitalId } = req.user;
    let selectClause = {
      startTime: true,
      endTime: true,
      id: true,
    };
    if (doctorId) {
      selectClause.doctorSlots = {
        where: {
          doctorId: doctorId,
          weekDaysId: weekDayId,
        },
      };
    }
    let slotList = await prisma.slots.findMany({
      where: {
        hospitalId: hospitalId,
      },
      select: selectClause,
    });

    let isDoctorAvailableForTheDay = false;
    let morningSlots = [];
    let afternoonSlots = [];
    let eveningSlots = [];
    slotList = slotList.map((slot) => {
      if (slot.doctorSlots && slot.doctorSlots.length > 0) {
        let slotDetails = slot.doctorSlots[0];
        isDoctorAvailableForTheDay = slotDetails.isDoctorAvailableForTheDay;
        const doctorSlotId = slotDetails.id;
        delete slot.doctorSlots;
        return {
          ...slot,
          doctorSlotId,
          isSlotSelected: true,
        };
      }
      delete slot.doctorSlots;
      return {
        ...slot,
        isSlotSelected: false,
      };
    });

    slotList.map((slot) => {
      if (determineTimePeriod(slot.startTime) === "morning") {
        morningSlots.push(slot);
      } else if (determineTimePeriod(slot.startTime) === "afternoon") {
        afternoonSlots.push(slot);
      } else {
        eveningSlots.push(slot);
      }
    });

    res.status(httpStatus.OK).send({
      message: "slots fetched successfully",
      success: true,
      data: {
        morningSlots,
        afternoonSlots,
        eveningSlots,
        slotDaySettings: {
          isDoctorAvailableForTheDay,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "error fetching slots",
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
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const searchQuery = req.query.search || "";
    const skip = limit * (page - 1);
    const { hospitalId } = req.user;
    let whereClause = {
      hospitalId: hospitalId,
      isActive: true,
      isDeleted: false,
    };
    if (searchQuery) {
      // whereClause.name = {
      //   search: "*" + searchQuery + "*",
      // };
      whereClause.name = {
        contains: searchQuery,
      };
    }
    const [ailmentList, count] = await prisma.$transaction([
      prisma.ailment.findMany({
        orderBy: {
          isDefault: "asc",
        },
        where: whereClause,
        take: limit,
        skip,
      }),
      prisma.ailment.count({
        where: whereClause,
      }),
    ]);
    await prisma.ailment.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
        isDeleted: false,
      },
      take: limit,
      skip,
    });
    res.status(httpStatus.OK).send({
      message: "Ailment list fetched successfully",
      success: true,
      data: {
        ailmentList,
        meta: {
          totalMatchingRecords: count,
        },
      },
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
    let prescriptions = req.body.prescriptions || [];
    let doctorRemarks = req.body.doctorRemarks || "";
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
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const searchQuery = req.query.search || "";
    const skip = limit * (page - 1);
    let whereClause = {
      hospitalId: hospitalId,
      isActive: true,
      isDeleted: false,
    };
    if (searchQuery) {
      whereClause.OR = [
        {
          medicationName: {
            contains: searchQuery,
          },
        },
        {
          code: {
            contains: searchQuery,
          },
        },
        {
          manufacturer: {
            contains: searchQuery,
          },
        },
      ];
    }
    const [medicationList, count] = await prisma.$transaction([
      prisma.medicationStocks.findMany({
        where: whereClause,
        take: limit,
        skip,
      }),
      prisma.medicationStocks.count({
        where: whereClause,
      }),
    ]);

    res.status(httpStatus.OK).send({
      message: "Medication list fetched",
      success: true,
      data: {
        medicationList: medicationList,
        meta: {
          totalMatchingRecords: count,
        },
      },
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

exports.getPatientList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const searchQuery = req.query.search;
    const skip = limit * (page - 1);
    const { hospitalId } = req.user;
    let whereClause = {
      hospitalId: hospitalId,
    };

    if (searchQuery) {
      whereClause.OR = [
        {
          patient: {
            name: {
              contains: searchQuery,
            },
          },
        },
        {
          patient: {
            phoneNumber: {
              contains: searchQuery,
            },
          },
        },
        {
          patient: {
            email: {
              contains: searchQuery,
            },
          },
        },
      ];
    }

    const [patientList, count] = await prisma.$transaction([
      prisma.hospitalPatients.findMany({
        skip,
        take: limit,
        where: whereClause,
        include: {
          patient: {
            select: {
              name: 1,
              id: 1,
              phoneNumber: 1,
              gender: 1,
              dateOfBirth: 1,
              bloodGroup: 1,
              isd_code: 1,
              email: 1,
            },
          },
        },
      }),
      prisma.hospitalPatients.count({
        where: whereClause,
      }),
    ]);
    res.status(httpStatus.OK).send({
      message: "Patient list fetched",
      success: true,
      data: {
        patientList,
        meta: {
          totalMatchingRecords: count,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching patient list",
      success: false,
      err: err,
    });
  }
};

exports.getAppointmentList = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = limit * (page - 1);
    const patientId = req.query.patientId;
    const { hospitalId } = req.user;
    const searchQuery = req.query.search;
    const appointmentStatus = req.query.appointmentStatus;
    let whereClause = {
      hospitalId,
    };
    if (appointmentStatus) {
      whereClause.appointmentStatus = appointmentStatus;
    }

    if (searchQuery) {
      whereClause.OR = [
        {
          patient: {
            name: {
              contains: searchQuery,
            },
          },
        },
        {
          doctor: {
            name: {
              contains: searchQuery,
            },
          },
        },
        {
          patient: {
            phoneNumber: {
              contains: searchQuery,
            },
          },
        },
      ];
    }

    if (patientId) {
      whereClause.patient = {
        id: patientId,
      };
    }

    const [appointmentList, count] = await prisma.$transaction([
      prisma.appointments.findMany({
        orderBy: [
          {
            appointmentDate: "asc",
          },
        ],
        skip,
        take: limit,
        where: whereClause,
        select: {
          id: true,
          appointmentDate: true,
          appointmentStatus: true,
          doctor: {
            select: {
              id: true,
              name: true,
              speciality: true,
              profilePictureUrl: true,
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              isd_code: true,
            },
          },
          ailment: {
            select: {
              id: true,
              name: true,
            },
          },
          doctorSlots: {
            select: {
              doctorId: true,
              weekDaysId: true,
              id: true,
              slot: {
                select: {
                  id: true,
                  startTime: true,
                  endTime: true,
                  hospitalId: true,
                },
              },
            },
          },
        },
      }),
      prisma.appointments.count({
        where: whereClause,
      }),
    ]);
    res.status(httpStatus.OK).send({
      message: "Appointment list fetched",
      success: true,
      data: {
        appointmentList,
        meta: {
          totalMatchingRecords: count,
        },
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

exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointmentDetails = await prisma.appointments.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        appointmentDate: true,
        appointmentStatus: true,
        hospitalId: true,
        remarks: true,
        doctorRemarks: true,
        patientPrescription: {
          select: {
            id: true,
            durationInDays: true,
            foodRelation: true,
            prescriptionDays: {
              select: {
                id: true,
                prescriptionDate: true,
                patientPrescription: true,
                prescriptionTimeOfDay: {
                  select: {
                    id: true,
                    timeOfDay: true,
                  },
                },
              },
            },
            medicationStock: {
              select: {
                medicationName: true,
                medicationDosage: true,
                id: true,
                code: true,
                manufacturer: true,
                description: true,
                dosageForm: true,
              },
            },
          },
        },
        patientAppointmentDocs: {
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
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
            profilePictureUrl: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isd_code: true,
            bloodGroup: true,
          },
        },
        ailment: {
          select: {
            id: true,
            name: true,
          },
        },
        doctorSlots: {
          select: {
            dayOfWeek: {
              select: {
                id: true,
                name: true,
              },
            },
            id: true,
            slot: {
              select: {
                id: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
    });
    if (appointmentDetails.patientAppointmentDocs.length > 0) {
      appointmentDetails.patientAppointmentDocs = await Promise.all(
        appointmentDetails.patientAppointmentDocs.map(async (doc) => {
          const signedUrl = await getPreSignedUrl(doc.bucketPath);
          return {
            ...doc,
            signedUrl: signedUrl,
          };
        }),
      );
    }
    if (appointmentDetails.patientPrescription.length > 0) {
      let patientPrescription = appointmentDetails.patientPrescription;
      appointmentDetails.patientPrescription = patientPrescription.map(
        (prescription) => {
          let timeOfDay = {};
          for (let prescriptionDays of prescription.prescriptionDays) {
            for (let pTimeOfDay of prescriptionDays.prescriptionTimeOfDay) {
              if (!timeOfDay[pTimeOfDay.timeOfDay]) {
                timeOfDay[pTimeOfDay.timeOfDay] = pTimeOfDay.timeOfDay;
              }
            }
          }
          delete prescription.prescriptionDays;
          return {
            ...prescription,
            timeOfDay: Object.keys(timeOfDay),
          };
        },
      );
    }
    res.status(httpStatus.OK).send({
      message: "Appointment details fetched",
      success: true,
      data: appointmentDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching Appointment details",
      success: false,
      err: err,
    });
  }
};
exports.getAdminDetails = async (req, res) => {
  try {
    const userDetails = req.user;
    if (userDetails.profilePictureUrl) {
      let signedUrl = await getPreSignedUrl(userDetails.profilePictureUrl);
      userDetails.signedUrl = signedUrl;
    }

    res.status(httpStatus.OK).send({
      message: "User details fetched",
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

exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    let patientDetails = await prisma.patients.findUnique({
      where: {
        id: patientId,
      },
    });
    if (patientDetails.profilePictureUrl) {
      let signedUrl = await getPreSignedUrl(patientDetails.profilePictureUrl);
      patientDetails.signedUrl = signedUrl;
    }

    res.status(httpStatus.OK).send({
      message: "Patient details fetched",
      success: true,
      data: patientDetails,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching patient details",
      success: false,
      err: err,
    });
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    let [totalAppointments, totalDoctors, totalPatients, activeAppointments] =
      await prisma.$transaction([
        prisma.appointments.count({
          where: {
            hospitalId: hospitalId,
          },
        }),
        prisma.users.count({
          where: {
            role: "DOCTOR",
            hospitalId,
          },
        }),
        prisma.hospitalPatients.count({
          where: {
            hospitalId,
          },
        }),
        prisma.appointments.count({
          where: {
            appointmentStatus: {
              in: ["APPROVED", "SCHEDULED"],
            },
            hospitalId,
          },
        }),
      ]);

    res.status(httpStatus.OK).send({
      message: "Dashboard overview",
      success: true,
      data: {
        totalAppointments,
        totalDoctors,
        totalPatients,
        activeAppointments,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching dashboard overview",
      success: false,
      err: err,
    });
  }
};

exports.getDashboardOverviewToday = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { startDate, endDate } = getStartAndEndOfDay(new Date());
    let [
      todaysAppointment,
      todaysPendingAppointment,
      todaysCancelledAppointments,
    ] = await prisma.$transaction([
      prisma.appointments.count({
        where: {
          hospitalId: hospitalId,
          appointmentDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.appointments.count({
        where: {
          appointmentStatus: {
            in: ["APPROVED", "SCHEDULED"],
          },
          hospitalId,
          appointmentDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.appointments.count({
        where: {
          appointmentStatus: "CANCELLED",
          hospitalId,
          appointmentDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
    ]);

    res.status(httpStatus.OK).send({
      message: "Dashboard overview today metrics",
      success: true,
      data: {
        todaysAppointment,
        todaysPendingAppointment,
        todaysCancelledAppointments,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching dashboard overview todays metrics",
      success: false,
      err: err,
    });
  }
};

exports.getFeedbackList = async (req, res) => {
  try {
    let { hospitalId } = req.user;
    const searchQuery = req.query.search;
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = limit * (page - 1);
    let whereClause = {
      hospitalId,
      isDeleted: false,
    };
    if (searchQuery) {
      whereClause.OR = [
        {
          appointment: {
            doctor: {
              name: {
                contains: searchQuery,
              },
            },
          },
        },
        {
          patient: {
            name: {
              contains: searchQuery,
            },
          },
        },
      ];
    }
    let [feedbackList, count] = await prisma.$transaction([
      prisma.appointmentFeedbacks.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: 1,
          overallSatisfaction: true,
          feedBackRemarks: true,
          appointment: {
            select: {
              id: true,
              appointmentStatus: true,
              appointmentDate: true,
              ailment: true,
              doctor: {
                select: {
                  id: true,
                  name: true,
                  speciality: true,
                  profilePictureUrl: true,
                  phoneNumber: true,
                  isd_code: true,
                },
              },
              doctorSlots: {
                select: {
                  id: true,
                  doctorId: true,
                  weekDaysId: true,
                  slot: {
                    select: {
                      id: true,
                      startTime: true,
                      endTime: true,
                      hospitalId: true,
                    },
                  },
                },
              },
              patient: {
                select: {
                  name: 1,
                  id: 1,
                  phoneNumber: 1,
                  isd_code: 1,
                  gender: 1,
                  dateOfBirth: 1,
                  bloodGroup: 1,
                  email: 1,
                },
              },
            },
          },
        },
      }),
      prisma.appointmentFeedbacks.count({
        where: whereClause,
      }),
    ]);

    res.status(httpStatus.OK).send({
      message: "Feedback list fetched",
      success: true,
      data: {
        feedbackList,
        meta: {
          totalMatchingRecords: count,
        },
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error fetching feedback list",
      success: false,
      err: err,
    });
  }
};
