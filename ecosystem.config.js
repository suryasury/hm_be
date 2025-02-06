module.exports = {
  apps: [
    {
      name: "hm_backend",
      script: "./index.js",
      env_prod: {
        NODE_ENV: "prod",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "c52bba2d3021547a9f92dc861a4f0ee44f1d72d6edac093a0ee224290362f6043a27e7b8c459fe02180674ba3f09a1d58f97e19a025ecc983fd75cfd1ac3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "9bff4a41f9d8a4c63952e6c3accebc0b25178a88828628ab949246b326e80001",
        PASSWORD_SALT_ROUNDS: 10,
        FILE_UPLOADER_SKEY: "WjaOViaIm0EgUnJr9ISoZzVpp88kjhU6jcdcfbX4",
        FILE_UPLOADER_AKEY: "AKIAU72LGEZF34TODC42",
        BUCKET_NAME_S3: "hms-01b7at5s6-assets",
        RESET_PASSWORD_FRONTEND_ROUTE_ADMIN: "reset-password/",
        RESET_PASSWORD_FRONTEND_ROUTE_PATIENT: "reset-password/",
        FRONTEND_URL_ADMIN: "https://hmssuperuser.siddhacure.com/",
        FRONTEND_URL_PATIENT: "https://patient.siddhacure.com/",
        SMTP_HOST: "smtppro.zoho.in",
        SMTP_PORT: "465",
        SMTP_EMAIL: "support@siddhacure.com",
        SMTP_PASSWORD: "di7$edsP",
      },
      env_uat: {
        NODE_ENV: "uat",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "c52bba2d3021547a9f92dc861a4f0ee44f1d72d6edac093a0ee224290362f6043a27e7b8c459fe02180674ba3f09a1d58f97e19a025ecc983fd75cfd1ac3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "9bff4a41f9d8a4c63952e6c3accebc0b25178a88828628ab949246b326e80001",
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
        SMTP_PASSWORD: "Mysupportmailpass@tech42",
      },
      env_demo: {
        NODE_ENV: "demo",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "c52bba2d3021547a9f92dc861a4f0ee44f1d72d6edac093a0ee224290362f6043a27e7b8c459fe02180674ba3f09a1d58f97e19a025ecc983fd75cfd1ac3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "9bff4a41f9d8a4c63952e6c3accebc0b25178a88828628ab949246b326e80001",
        PASSWORD_SALT_ROUNDS: 10,
        FILE_UPLOADER_SKEY: "pKgIx7U+X/saTyHu8zWUIFHFcuLl0jvW7JPzvgUN",
        FILE_UPLOADER_AKEY: "AKIAZAN7IW3SERD6IOQO",
        BUCKET_NAME_S3: "dev-hms-01a7-assets.tech42.in",
        RESET_PASSWORD_FRONTEND_ROUTE_ADMIN: "reset-password/",
        RESET_PASSWORD_FRONTEND_ROUTE_PATIENT: "reset-password/",
        FRONTEND_URL_ADMIN: "https://demo-hms-admin.tech42.in/",
        FRONTEND_URL_PATIENT: "https://demo-hms-patient.tech42.in/",
        SMTP_HOST: "smtppro.zoho.in",
        SMTP_PORT: "465",
        SMTP_EMAIL: "support@tech42.in",
        SMTP_PASSWORD: "Mysupportmailpass@tech42",
      },
      env_dev: {
        NODE_ENV: "dev",
        PORT: 3030,
        DATABASE_URL:
          "mysql://root:password@123@localhost:3306/hospital_management",
        JWT_SECRET:
          "c52bba2d3021547a9f92dc861a4f0ee44f1d72d6edac093a0ee224290362f6043a27e7b8c459fe02180674ba3f09a1d58f97e19a025ecc983fd75cfd1ac3bf1a",
        PASSWORD_ENCRYPT_KEY:
          "9bff4a41f9d8a4c63952e6c3accebc0b25178a88828628ab949246b326e80001",
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
        SMTP_PASSWORD: "Mysupportmailpass@tech42",
      },
    },
  ],
};
