const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.FILE_UPLOADER_AKEY,
    secretAccessKey: process.env.FILE_UPLOADER_SKEY,
  },
  region: "ap-south-1",
});
const httpStatus = require("http-status");

exports.uploadCustomerMedicalRecords = async (req, res) => {
  try {
    let { id } = req.user;
    const files = req.files;
    let filePromises = files.map(async (file) => {
      let pathInBucket = `patients/${id}/records/${Date.now().toString()}-${
        file.originalname
      }`;
      const params = {
        Bucket: process.env.BUCKET_NAME_S3,
        Key: pathInBucket,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const putCommand = new PutObjectCommand(params);
      await s3.send(putCommand);
      delete params.Body;
      delete params.ContentType;
      const getCommand = new GetObjectCommand(params);
      const preSignedUrl = await getSignedUrl(s3, getCommand, {
        expiresIn: 3600,
      });
      let fileNameArr = file.originalname.split(".");
      return {
        signedUrl: preSignedUrl,
        bucketPath: pathInBucket,
        fileName: file.originalname,
        contentType: file.mimetype,
        fileExtension: fileNameArr[fileNameArr.length - 1].toUpperCase(),
      };
    });
    let result = await Promise.all(filePromises);
    res.status(httpStatus.OK).send({
      message: "Documents uploaded successfully",
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error uploading documents",
      success: false,
      err: err,
    });
  }
};

exports.getPreSignedUrl = async (path) => {
  try {
    const params = {
      Bucket: process.env.BUCKET_NAME_S3,
      Key: path,
    };
    const getCommand = new GetObjectCommand(params);
    const preSignedUrl = await getSignedUrl(s3, getCommand, {
      expiresIn: 3600,
    });
    return preSignedUrl;
  } catch (err) {
    throw err;
  }
};
