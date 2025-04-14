# Trust HealthCare Website (Server)

## Summary

1.  Server Setup
2.  Database Setup (Postgres)
3.  Cloudinary Setup
4.  MiddleWare
5.  Models
6.  Routes
7.  Controllers

## 1.0 Server Setup

- run npm init and npx tsc --init to create tsconfig.json file
- install necessary dependencies (with types for typeScript)
- create the app.ts file to run express server
- create the server.ts file to run the app server
- create the tsconfig.json file before running the server in development mode
- run the server

## 2.0 Database Setup (Postgres)

- Setup the database config file using sequelize
- Connect the database
- Manage the database with PgAdmin app

## 3.0 Cloudinary Setup

1. Create the cloudinary config file.
2. Add keys in environment variables.

## 4.0 MiddleWare

### 4.1 Error handling (all routes)

- Set up error handler class (inheritance from the Error class).
- Set up an error handling middleware on all requests.
- Set up a catch async error middleware for async functions(to avoid multiple try/catch).

### 4.2 Request Limiter (all routes)

- Create a request limit on all requests (security against DDOs attack).

### 4.3 User Authentication (protected routes)

- Check if user is logged in before handling the requests
- Verify if access token is valid.
- User should log in if access token has expired

### 4.4 Restrict Password Reset to once in 24 hours (forgot-password route)

- Check if user has changed their password in the past 24 hours

## 5.0 Models

### 5.1 User Model

- Create a User class(inheritance from the Model class from sequelize typescript).
- Create the database Table with default scopes (set the timestamps to true).
- Create each columns for each user data and set their types (id, name, email,...).

### 5.2 Doctor Model

- Same as the User Model
- Link with the Patient, Appointment models when necessary.

### 5.3 Patient, Appoiintment, Transaction Models

- Same as the User and Doctor Models
- Link with any connecting models when necessary.

## 6.0 Routes

### 6.1 Authentication Routes

- Register User - authRouter.post("/signup", registerUser)
- Verify Account - authRouter.post("/account-verification", accountVerification)
- Resend Verification Code - authRouter.post("/resend-verification-code", resendVerificationCode)
- Login User - authRouter.post("/login", loginUser)
- Sign Out User - authRouter.post("/signout", isUserAuthenticated, signOut)
- Refresh Tokens - authRouter.get("/refresh-tokens", updateToken, refreshToken)

### 6.2 User Routes

- Forgot Password - userRouter.post("/forgot-password", hasPasswordChangedLast24Hours, forgotPassword)
- Reset Password - userRouter.post("/reset-password", resetPassword)
- Fetch User Information - userRouter.get("/me", isUserAuthenticated, getUserData)

### 6.3 Doctor Routes

- Upload Doctor - doctorRouter.post("/upload-doctor", isUserAuthenticated, authorizeUpload("admin", "user"), formParser, validateDoctorData, uploadDoctor)
- Get Doctors (free) - doctorRouter.get("/get-all-doctors-free", getAllDoctorsList)
- Update Doctor - (doctorRouter.put("/update-doctor/:doctor_id", isUserAuthenticated, hasDoctorProfileBeenUpdatedLast7days, authorizeUpload("admin", "doctor"), formParser, validateDoctorData, updateDoctor))
- Get Doctors (for landing page) - (doctorRouter.get("/get-some-doctors-free", getSomeDoctorsUnauthenticated))
- Get Doctors (for doctors page) - (doctorRouter.get("/get-all-doctors-user", isUserAuthenticated, getAllDoctorsList))
- Get a Doctor (for doctor details page) - (doctorRouter.get("/get-doctor/:doctor_id", isUserAuthenticated, getDoctor))

## 7.0 Controllers

### 7.1 Authentication Controller

### a. Register User

- Get the user data from the request body and validate them.
- Create a verification code and a verification token using jwt to verify user email (make token valid only for few minutes).
- Send the token to the user email or user phone number.

### b. Verify Account

- Validate the verification code and token provided from the request.
- Verify if user does not exists already in the database.
- Save user to the database.

### c. Resend Verification Code

- If initial verification token/code is invalid, user can request for another verification code.
- Repeat the steps again for the register user function.

### d. Login User

- Validate the email and password
- Update the user login date/time in the database
- Generate 2 tokens with jwt (access and refresh) and save in the response cookie (security)
- Access token should have short expiration time while Refresh token should have longer expiration time.

### e. Sign Out User

- Check if user is logged in first before signing out
- Clear the tokens from the response

### f. Refresh Tokens

- Refresh Tokens to keep tokens constantly changing
- If old refresh token is still valid, generate new ones. Else, user should login again

---

### 7.2 User Controller

### a. Forgot Password

- Check item 4.4 for the "hasPasswordChangedLast24Hours" middleware
- Create a reset token (with expiration time) and code and send to the user email or phone.
- Save the reset token in the response cookie

### b. Reset Password

- Validate the token and the new user password
- Update the password reset time and save to the database

### c. Fetch User Information

- Fetch user details from the database

---

### 7.3 Doctor Controller

### a. Upload Doctor

- Validate the form from the client
- Upload doctor image to cloudinary server
- Create Doctor

### b. Update Doctor

- Check if account has been updated in a week
- Repeat same as upload doctor

### c. Get Doctors (for landing page)

- Fetch few doctors for landing page
- Limit the amount of doctors and also hide some vital fields

### d. Get Doctors (for doctors page)

- Fetch doctors
- Apply the search, filter, sort functionality

### e. Get a Doctor (for doctor details page)

- Fetch doctors detail using their id
- Display neccessary fields

---
