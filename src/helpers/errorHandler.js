const httpStatus = require("http-status");
const errorHandler = (error, res) => {
  let errorResponse = {};
  let statusCode = "";
  if (error && error.name) {
    if (
      error.name === "PrismaClientKnownRequestError" &&
      error.code === "P2002"
    ) {
      statusCode = httpStatus.CONFLICT;
      errorResponse = {
        message: error.meta.modelName.toUpperCase() + " already exists.",
        success: false,
        error: error.message,
      };
    } else {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        message: error.message,
        success: false,
        error: error,
      };
    }
  } else {
    statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    errorResponse = {
      message: error.message,
      success: false,
      error: error,
    };
  }
  errorResponse.success = false;
  return res.status(statusCode).send(errorResponse);
};

module.exports = errorHandler;
