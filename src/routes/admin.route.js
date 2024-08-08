const express = require("express");
const router = express.Router();
const adminController = require("../controllers").adminController;

router.get("/login", adminController.getRoles);
router.post("/hospital/create", adminController.createHospitals);
router.post("/hospital/doctor/create", adminController.createDoctors);
router.post("/hospital/weekdays/create", adminController.createWeekDays);
router.post("/hospital/slots/create", adminController.createSlots);
router.post("/hospital/doctorslot/create", adminController.createDoctorsSlot);
router.post("/hospital/ailment/create", adminController.createAilment);
router.post("/hospital/doctype/create", adminController.createdocumentType);
router.post(
  "/hospital/appointment/update/status",
  adminController.updateAppointmentStatus,
);
router.post("/hospital/medication/create", adminController.createMedication);

module.exports = router;
