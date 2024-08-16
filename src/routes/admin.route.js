const express = require("express");
const verifyAdminAccessToken = require("../middlewares/verifyAdminAccessToken");
const router = express.Router();
const adminController = require("../controllers").adminController;

router.post("/login", adminController.login);
router.post("/signup", adminController.signUp);
router.get("/details", verifyAdminAccessToken, adminController.getAdminDetails);
router.get(
  "/patient/details/:patientId",
  verifyAdminAccessToken,
  adminController.getPatientDetails,
);
router.post(
  "/hospital/create",
  // verifyAdminAccessToken,
  adminController.createHospitals,
);
router.post(
  "/hospital/doctor/create",
  verifyAdminAccessToken,
  adminController.createDoctors,
);
router.post(
  "/hospital/weekdays/create",
  verifyAdminAccessToken,
  adminController.createWeekDays,
);
router.post(
  "/hospital/slots/create",
  verifyAdminAccessToken,
  adminController.createSlots,
);
router.post(
  "/hospital/doctorslot/create",
  verifyAdminAccessToken,
  adminController.createDoctorsSlot,
);
router.post(
  "/hospital/ailment/create",
  verifyAdminAccessToken,
  adminController.createAilment,
);
router.patch(
  "/hospital/ailment/update/:ailmentId",
  verifyAdminAccessToken,
  adminController.updateAilment,
);
router.get(
  "/hospital/ailment/list",
  verifyAdminAccessToken,
  adminController.getAlimentList,
);
router.delete(
  "/hospital/ailment/delete/:ailmentId",
  verifyAdminAccessToken,
  adminController.deleteAilment,
);
router.post(
  "/hospital/doctype/create",
  verifyAdminAccessToken,
  adminController.createdocumentType,
);
router.get(
  "/hospital/appointment/list",
  verifyAdminAccessToken,
  adminController.getAppointmentList,
);
router.get(
  "/hospital/appointment/details/:appointmentId",
  verifyAdminAccessToken,
  adminController.getAppointmentDetails,
);
router.post(
  "/hospital/appointment/update/status",
  verifyAdminAccessToken,
  adminController.updateAppointmentStatus,
);
router.post(
  "/hospital/medication/create",
  verifyAdminAccessToken,
  adminController.createMedication,
);
router.get(
  "/hospital/medication/list",
  verifyAdminAccessToken,
  adminController.getMedicationList,
);
router.patch(
  "/hospital/medication/update/:medicationId",
  verifyAdminAccessToken,
  adminController.updateMedicationDetails,
);
router.delete(
  "/hospital/medication/delete/:medicationId",
  verifyAdminAccessToken,
  adminController.deleteMedication,
);
router.get(
  "/hospital/patients/list",
  verifyAdminAccessToken,
  adminController.getPatientList,
);

module.exports = router;
