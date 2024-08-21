const express = require("express");
const router = express.Router();
const verifyUserAccessToken = require("../middlewares/verifyAccessToken");
const commonController = require("../controllers").commonController;
const multer = require("multer");
const verifyAdminAccessToken = require("../middlewares/verifyAdminAccessToken");
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const mimeType = allowedTypes.test(file.mimetype);
    if (mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only Image and PDF files are allowed."));
    }
  },
});

router.post(
  "/customer/upload/records",
  verifyUserAccessToken,
  upload.array("files"),
  commonController.uploadCustomerMedicalRecords,
);

router.post(
  "/customer/upload/profilepicture",
  verifyUserAccessToken,
  upload.single("file"),
  commonController.updateUserProfilePicture,
);

router.post(
  "/:userType/update/profilepicture",
  verifyAdminAccessToken,
  upload.single("file"),
  commonController.updateAdminsProfilePicture,
);
module.exports = router;
