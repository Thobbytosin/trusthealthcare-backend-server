import request from "supertest";
import { createTestApp } from "../../app-test";
import { after } from "node:test";
import connectToDB from "../../utils/db";
import disconnectDB from "../../utils/disconnectDb";
import bcryptjs from "bcryptjs";

// mock jest
jest.mock("bcryptjs", () => {
  return {
    __esModule: true, // Support ESModule-style import
    default: {
      hashSync: jest.fn(() => "mockedHashedPassword"),
    },
  };
});

describe("POST /api/v1/signup", () => {
  let appTest: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    appTest = createTestApp();

    await connectToDB();
  });

  after(async () => {
    await disconnectDB();
  });

  // 1. TEST IF REQUEST BODY IS EMPTY
  it("return 400 error code if request body is empty", async () => {
    const res = await request(appTest).post("/api/v1/signup").send({});

    // expectations
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("All fields are required");
  }, 10000);

  //   TEST IF EMAIL ALREADY EXISTS
  it("should return 409 error code if email already exists", async () => {
    const res = await request(appTest).post("/api/v1/signup").send({
      name: "Falode Tobi",
      email: "gabrieltobiloba11@gmail.com",
      password: "Password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Account already exists");
  }, 10000);

  //   TEST EMAIL VALIDITY
  it("return 400 error code if email is not valid", async () => {
    const res = await request(appTest).post("/api/v1/signup").send({
      name: "Falode Tobi",
      email: "gabrieltobiloba11",
      password: "Password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please enter a valid email");
  }, 10000);

  //   TEST PASSWORD SECURITY
  it("return 400 error code if password is too weak", async () => {
    const res = await request(appTest).post("/api/v1/signup").send({
      name: "Falode Tobi",
      email: "gabrieltobiloba12@gmail.com",
      password: "Pas123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password security is too weak");
  }, 10000);

  //   TEST IF PASSWORD WAS HASHED
  it("should hash the password before registering", async () => {
    const password = "Pasword123";

    const res = await request(appTest).post("/api/v1/signup").send({
      name: "Falode Tobi",
      email: "hashpassword@gmail.com",
      password,
    });

    expect(bcryptjs.hashSync).toHaveBeenCalledWith(password, 10);
  }, 10000);

  //   TEST IF VERIFICATION CODE IS SENT AND TOKEN SET SUCCESSFUL
  it("should send a verification code and set token and return 200 success code", async () => {
    const res = await request(appTest).post("/api/v1/signup").send({
      name: "Falode Tobi",
      email: "gabrieltobiloba14@gmail.com",
      password: "Password11",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "A 6-digit verification code has been sent to your email address."
    );
    expect(res.headers["set-cookie"]).toBeDefined();
  }, 30000);

  //   TEST TOKEN IS SET WITH CORRECT OPTIONS
  it("should set verifcation_token with correct cookie option", async () => {
    const res = await request(appTest).post("/api/v1/signup").send({
      name: "Falode Tobi",
      email: "gabrieltobiloba14@gmail.com",
      password: "Password11",
    });

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/verification_token/);
  }, 10000);
});

// import request from "supertest";
// import appTest from "../../app"; // your express app
// import jwt from "jsonwebtoken";
// import User from "../../models/User";
// import sendMail from "../../utils/sendMail";

// jest.mock("../../models/User");
// jest.mock("../../utils/sendMail");

// describe("POST /api/v1/account-verification", () => {
//   const endpoint = "/api/v1/account-verification"; // or wherever it's routed

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 403 if no verification token in cookies", async () => {
//     const res = await request(appTest)
//       .post(endpoint)
//       .send({ verificationCode: "123456" });

//     expect(res.status).toBe(403);
//     expect(res.body.message).toBe("Verification code has expired");
//   });

//   it("should return 403 if no verification code in body", async () => {
//     const res = await request(appTest)
//       .post(endpoint)
//       .set("Cookie", ["verification_token=fake-token"]);

//     expect(res.status).toBe(403);
//     expect(res.body.message).toBe("All fields are required");
//   });

//   it("should return 403 if verification codes do not match", async () => {
//     jest.spyOn(jwt, "verify").mockReturnValue({
//       user: { name: "Falode Tobi", email: "tobi@gmail.com", password: "pass" },
//       verificationCode: "999999", // mismatched
//     });

//     const res = await request(appTest)
//       .post(endpoint)
//       .set("Cookie", ["verification_token=fake-token"])
//       .send({ verificationCode: "123456" });

//     expect(res.status).toBe(403);
//     expect(res.body.message).toBe("Access Denied: Invalid Verification code");
//   });

//   it("should return 403 if user already exists", async () => {
//     jest.spyOn(jwt, "verify").mockReturnValue({
//       user: { name: "Falode Tobi", email: "tobi@gmail.com", password: "pass" },
//       verificationCode: "123456",
//     });

//     (User.findOne as jest.Mock).mockResolvedValue({ id: "existing-user" });

//     const res = await request(appTest)
//       .post(endpoint)
//       .set("Cookie", ["verification_token=fake-token"])
//       .send({ verificationCode: "123456" });

//     expect(res.status).toBe(403);
//     expect(res.body.message).toBe("Account already exists");
//   });

//   it("should return 404 if user creation failed", async () => {
//     jest.spyOn(jwt, "verify").mockReturnValue({
//       user: { name: "Falode Tobi", email: "tobi@gmail.com", password: "pass" },
//       verificationCode: "123456",
//     });

//     (User.findOne as jest.Mock)
//       .mockResolvedValueOnce(null) // first findOne (check existence)
//       .mockResolvedValueOnce(null); // second findOne (after creation)

//     (User.create as jest.Mock).mockResolvedValue({});

//     const res = await request(appTest)
//       .post(endpoint)
//       .set("Cookie", ["verification_token=fake-token"])
//       .send({ verificationCode: "123456" });

//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("Error Proccessing User");
//   });

//   it("should successfully create user, send welcome email, and return 201", async () => {
//     jest.spyOn(jwt, "verify").mockReturnValue({
//       user: { name: "Falode Tobi", email: "tobi@gmail.com", password: "pass" },
//       verificationCode: "123456",
//     });

//     (User.findOne as jest.Mock)
//       .mockResolvedValueOnce(null) // first findOne (check existence)
//       .mockResolvedValueOnce({
//         name: "Falode Tobi",
//         email: "tobi@gmail.com",
//         password: "pass",
//       }); // second findOne (after creation)

//     (User.create as jest.Mock).mockResolvedValue({});
//     (sendMail as jest.Mock).mockResolvedValue({});

//     const res = await request(appTest)
//       .post(endpoint)
//       .set("Cookie", ["verification_token=fake-token"])
//       .send({ verificationCode: "123456" });

//     expect(res.status).toBe(201);
//     expect(res.body.message).toBe("Account Verification Successful!");
//   });

//   it("should return 404 if sendMail throws an error", async () => {
//     jest.spyOn(jwt, "verify").mockReturnValue({
//       user: { name: "Falode Tobi", email: "tobi@gmail.com", password: "pass" },
//       verificationCode: "123456",
//     });

//     (User.findOne as jest.Mock)
//       .mockResolvedValueOnce(null)
//       .mockResolvedValueOnce({
//         name: "Falode Tobi",
//         email: "tobi@gmail.com",
//         password: "pass",
//       });

//     (User.create as jest.Mock).mockResolvedValue({});
//     (sendMail as jest.Mock).mockRejectedValue(new Error("Mail failed"));

//     const res = await request(appTest)
//       .post(endpoint)
//       .set("Cookie", ["verification_token=fake-token"])
//       .send({ verificationCode: "123456" });

//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("Mail failed");
//   });
// });
