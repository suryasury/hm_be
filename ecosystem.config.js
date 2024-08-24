module.exports = {
  apps: [
    {
      name: "hm_backend",
      script: "./index.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "uwyiausa887ahs92dc861a4f0eeiusiq98w9qjsiqsjqwuqi9899qiwq8990674ba3f09a1d58f97e19a025kjoiwoq89w89qwoiwqc3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "3d09c8b30cf4983ab8d2128e93267fe5a9943fd98feb02c09390fa504ec77c29",
        PASSWORD_SALT_ROUNDS: 10,
        FILE_UPLOADER_SKEY: "pKgIx7U+X/saTyHu8zWUIFHFcuLl0jvW7JPzvgUN",
        FILE_UPLOADER_AKEY: "AKIAZAN7IW3SERD6IOQO",
        BUCKET_NAME_S3: "dev-hms-01a7-assets.tech42.in",
      },
      env_uat: {
        NODE_ENV: "uat",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "c52bba2d3021547a9f92dc861a4f0ee44f1d72d6edac093a0ee224290362f6043a27e7b8c459fe02180674ba3f09a1d58f97e19a025ecc983fd75cfd1ac3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "3d09c8b30cf4983ab8d2128e93267fe5a9943fd98feb02c09390fa504ec77c29",
        PASSWORD_SALT_ROUNDS: 10,
        FILE_UPLOADER_SKEY: "pKgIx7U+X/saTyHu8zWUIFHFcuLl0jvW7JPzvgUN",
        FILE_UPLOADER_AKEY: "AKIAZAN7IW3SERD6IOQO",
        BUCKET_NAME_S3: "dev-hms-01a7-assets.tech42.in",
        RESET_PASSWORD_FRONTEND_ROUTE_ADMIN: "reset-password/",
        RESET_PASSWORD_FRONTEND_ROUTE_PATIENT: "reset-password/",
        FRONTEND_URL_ADMIN: "https://dev-admin.tech42.in/",
        FRONTEND_URL_PATIENT: "https://dev-patient.tech42.in/",
        SMTP_HOST: "smtppro.zoho.in",
        SMTP_PORT: "465",
        SMTP_EMAIL: "support@tech42.in",
        SMTP_PASSWORD: "#9Nactzw",
      },
      env_dev: {
        NODE_ENV: "dev",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "c52bba2d3021547a9f92dc861a4f0ee44f1d72d6edac093a0ee224290362f6043a27e7b8c459fe02180674ba3f09a1d58f97e19a025ecc983fd75cfd1ac3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "3d09c8b30cf4983ab8d2128e93267fe5a9943fd98feb02c09390fa504ec77c29",
        PASSWORD_SALT_ROUNDS: 10,
        FILE_UPLOADER_SKEY: "pKgIx7U+X/saTyHu8zWUIFHFcuLl0jvW7JPzvgUN",
        FILE_UPLOADER_AKEY: "AKIAZAN7IW3SERD6IOQO",
        BUCKET_NAME_S3: "dev-hms-01a7-assets.tech42.in",
        RESET_PASSWORD_FRONTEND_ROUTE_ADMIN: "reset-password/",
        RESET_PASSWORD_FRONTEND_ROUTE_PATIENT: "reset-password/",
        FRONTEND_URL_ADMIN: "http://localhost:5173/",
        FRONTEND_URL_PATIENT: "http://localhost:5173/",
        SMTP_HOST: "smtppro.zoho.in",
        SMTP_PORT: "465",
        SMTP_EMAIL: "support@tech42.in",
        SMTP_PASSWORD: "#9Nactzw",
      },
    },
  ],
};
