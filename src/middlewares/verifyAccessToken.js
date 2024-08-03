let jwt = require("jsonwebtoken");
let error = require("../helpers/errorHandler");
const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    let jwtToken = req.cookies.sessionToken;
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtToken) {
      let jwtData = jwt.verify(jwtToken, jwtSecret, (err, payload) => {
        if (err) {
          return {
            error: err,
            data: {},
            success: false,
            message: "Token malformed",
          };
        }
        return { data: payload, success: true };
      });
      if (jwtData.success) {
        let user = JSON.parse(jwtData.data.data);
        let userData = await prisma.patients.findUnique({
          where: {
            id: user.userId,
          },
        });
        if (userData) {
          req.user = userData;
          return next();
        } else {
          return error(
            {
              statusCode: httpStatus.UNAUTHORIZED,
              message: "User not found or invalid user",
              error: {},
            },
            res,
          );
        }
      } else {
        res.clearCookie("sessionToken");
        return error(
          {
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Session expired. Please login again",
            error: jwtData.error,
          },
          res,
        );
      }
    } else {
      res.clearCookie("sessionToken");
      return error(
        {
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Unauthorized. Please login",
          error: {},
        },
        res,
      );
    }
  } catch (err) {
    error(err, res);
    return error(
      {
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Internal server error. Please try again after sometime",
        error: err,
      },
      res,
    );
  }
};
