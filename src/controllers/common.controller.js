const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.FILE_UPLOADER_AKEY,
    secretAccessKey: process.env.FILE_UPLOADER_SKEY,
  },
  // useAccelerateEndpoint: true,
  region: "ap-south-1",
});
const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PART_SIZE = 5 * 1024 * 1024; // 5 MB

exports.uploadCustomerMedicalRecords = async (req, res) => {
  try {
    let { id } = req.user;
    const files = req.files;
    let filePromises = files.map(async (file) => {
      let pathInBucket = `patients/${id}/records/${Date.now().toString()}-${
        file.originalname
      }`;
      const serviceResponse = await this.uploadDocumentToS3(file, pathInBucket);
      return serviceResponse;
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

exports.updateUserProfilePicture = async (req, res) => {
  try {
    let { id } = req.user;
    const file = req.file;
    const bucketPath = `patients/${id}/profilepicture/${Date.now().toString()}-${
      file.originalname
    }`;
    let serviceResponse = await this.uploadDocumentToS3(file, bucketPath);
    await prisma.patients.update({
      where: {
        id,
      },
      data: {
        profilePictureUrl: serviceResponse.bucketPath,
      },
    });
    res.status(httpStatus.OK).send({
      message: "Profile picture updated",
      success: true,
      data: {
        signedUrl: serviceResponse.signedUrl,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error updating profile picture",
      success: false,
      err: err,
    });
  }
};

exports.updateAdminsProfilePicture = async (req, res) => {
  try {
    const { userType } = req.params;
    const file = req.file;
    const bucketPath = `${userType}/profilepicture/${Date.now().toString()}-${
      file.originalname
    }`;
    let serviceResponse = await this.uploadDocumentToS3(file, bucketPath);
    res.status(httpStatus.OK).send({
      message: "Profile picture uploaded",
      success: true,
      data: serviceResponse,
    });
  } catch (err) {
    console.log("err", err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error uploading profile picture",
      success: false,
      err: err,
    });
  }
};
exports.uploadDocumentToS3 = async (file, bucketPath) => {
  try {
    let pathInBucket = bucketPath;

    if (file.size <= PART_SIZE) {
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
    } else {
      const params = {
        Bucket: process.env.BUCKET_NAME_S3,
        Key: pathInBucket,
        ContentType: file.mimetype,
      };
      const multipartUploadCommand = new CreateMultipartUploadCommand(params);
      const multipartDetails = await s3.send(multipartUploadCommand);
      const uploadId = multipartDetails.UploadId;
      let partNumber = 1;
      let offset = 0;
      let promiseArray = [];
      while (offset < file.size) {
        const partParams = {
          Bucket: process.env.BUCKET_NAME_S3,
          Key: pathInBucket,
          Body: file.buffer.slice(offset, offset + PART_SIZE),
          UploadId: uploadId,
          PartNumber: partNumber,
        };
        promiseArray.push(uploadPart(partParams, partNumber));
        offset += PART_SIZE;
        partNumber++;
      }
      const partETags = await Promise.all(promiseArray);
      const multipartCompleteParams = {
        Bucket: process.env.BUCKET_NAME_S3,
        Key: pathInBucket,
        UploadId: uploadId,
        MultipartUpload: { Parts: partETags },
      };
      const multiPartCompleteCommand = new CompleteMultipartUploadCommand(
        multipartCompleteParams,
      );
      await s3.send(multiPartCompleteCommand);
    }
    const getParams = {
      Bucket: process.env.BUCKET_NAME_S3,
      Key: pathInBucket,
    };
    const getCommand = new GetObjectCommand(getParams);
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
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

const uploadPart = async (params, partNumber) => {
  try {
    const command = new UploadPartCommand(params);
    const data = await s3.send(command);
    return { ETag: data.ETag, PartNumber: partNumber };
  } catch (error) {
    console.error("Error uploading part:", error);
    throw error;
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
    console.log("err", err);
    throw err;
  }
};

exports.deleteDocumentFromS3 = async (bucketPath) => {
  try {
    let pathInBucket = bucketPath;
    const params = {
      Bucket: process.env.BUCKET_NAME_S3,
      Key: pathInBucket,
    };
    const deleteCommand = new DeleteObjectCommand(params);
    const serviceResponse = await s3.send(deleteCommand);
    return serviceResponse;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};
