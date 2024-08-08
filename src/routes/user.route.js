const express = require("express");
const verifyAccessToken = require("../middlewares/verifyAccessToken");
const router = express.Router();
const userController = require("../controllers").userController;

router.post("/signup", userController.signUp);
router.post("/login", userController.login);
router.get("/details", verifyAccessToken, userController.userDetails);
router.patch(
  "/profile/details/update",
  verifyAccessToken,
  userController.updateUserDetails,
);
router.get("/doctors/list", verifyAccessToken, userController.doctorList);
router.get(
  "/slots/weekdaylist",
  verifyAccessToken,
  userController.getWeekDaysList,
);
router.get(
  "/slots/:doctorId/:weekDayId",
  verifyAccessToken,
  userController.doctorSlotDetails,
);
router.post(
  "/appointment/create",
  verifyAccessToken,
  userController.createAppointment,
);
router.patch(
  "/appointment/update/:appointmentId",
  verifyAccessToken,
  userController.updateAppointmentDetails,
);
router.get(
  "/appointment/list",
  verifyAccessToken,
  userController.getAppointmentList,
);
router.get(
  "/appointment/history/list",
  verifyAccessToken,
  userController.getAppointmentHistoryList,
);
router.get(
  "/appointment/details/:appointmentId",
  verifyAccessToken,
  userController.getAppointmentDetails,
);
router.get(
  "/prescription/daywise/details",
  verifyAccessToken,
  userController.getPrescriptionDetails,
);
router.patch(
  "/prescription/medication/status/update",
  verifyAccessToken,
  userController.updatePatientPrescriptionStatus,
);
router.post(
  "/appointment/feedback",
  verifyAccessToken,
  userController.createFeedbackForAppointment,
);
router.patch(
  "/appointment/feedback/:feedbackId",
  verifyAccessToken,
  userController.updateFeedbackForAppointment,
);
router.get(
  "/ailment/list/:hospitalId",
  verifyAccessToken,
  userController.getAilmentList,
);
router.get(
  "/documenttype/list/:hospitalId",
  verifyAccessToken,
  userController.getDocumentTypes,
);
module.exports = router;
