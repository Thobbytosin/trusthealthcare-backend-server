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
