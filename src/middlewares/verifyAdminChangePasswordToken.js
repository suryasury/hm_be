let jwt = require("jsonwebtoken");
let error = require("../helpers/errorHandler");
const httpStatus = require("http-status");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    let jwtToken = req.headers.token;
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtToken) {
      let jwtData = jwt.verify(jwtToken, jwtSecret, (err, payload) => {
        if (err) {
          return {
            error: err,
            data: {},
            success: false,
            message: "Token Expired",
          };
        }
        return { data: payload, success: true };
      });
      if (jwtData.success) {
        let user = JSON.parse(jwtData.data.data);
        let userData = await prisma.users.findUnique({
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
        return error(
          {
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Token Expired",
            error: jwtData.error,
          },
          res,
        );
      }
    } else {
      return error(
        {
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token Expired",
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
