const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getRoles = async (req, res) => {
  res.status(200).send({ message: "Api is working" });
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
      success: true,
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
      success: true,
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
      success: true,
      err: err,
    });
  }
};

exports.createSlots = async (req, res) => {
  try {
    const interval = parseInt(req.query.interval, 10);
    const hospitalId = req.query.hospitalId;

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
      const startString = `${startHours % 12 || 12}:${startMinutes
        .toString()
        .padStart(2, "0")} ${startAMPM}`;
      const endString = `${endHours % 12 || 12}:${endMinutes
        .toString()
        .padStart(2, "0")} ${endAMPM}`;
      slots.push({
        startTime: startString,
        endTime: endString,
        hospitalId: hospitalId,
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
      success: true,
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
      success: true,
      err: err,
    });
  }
};
