import { createTestApp } from "../../app-test";
import connectToDB from "../../utils/db";
import disconnectDB from "../../utils/disconnectDb";
import request from "supertest";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import sendMail from "../../utils/sendMail";

jest.mock("../../models/user.model.ts");
jest.mock("../../utils/sendMail.ts");

describe("POST /api/v1/account-verification", () => {
  const endpoint = "/api/v1/account-verification";
  let appTest: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    appTest = createTestApp();

    await connectToDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  //   TEST FOR VERIFICATION TOKEN
  it("return 403 error code if there is no verification token", async () => {
    const res = await request(appTest)
      .post(endpoint)
      .send({ verificationCode: "123456" });

    // console.log(res.body);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Verification code has expired");
  }, 10000);

  //   TEST FOR VERIFICATION CODE
  it("return 403 error code if there is no verification code", async () => {
    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"]);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("All fields are required");
  });

  //   TEST IF VERIF.. CODES MATCH
  it("return error 403 if verification codes does not match", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({
      user: { name: "Tobi", email: "test@gmail.com", password: "pass22" },
      verificationCode: "123455",
    } as any);

    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"])
      .send({ verificationCode: "123456" });

    // console.log(res.body);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Access Denied: Invalid Verification code");
  }, 10000);

  //   TEST IF USER EXISTS
  it("should return 403 if user already exists", async () => {
    // Mock the jwt.verify function to simulate decoded token data.
    jest.spyOn(jwt, "verify").mockReturnValue({
      user: { name: "Falode Tobi", email: "tobi@gmail.com", password: "pass" },
      verificationCode: "123456",
    } as any);

    // Mock User.findOne to simulate that the user already exists in the database.
    const findOneSpy = jest.spyOn(User, "findOne").mockResolvedValue({
      id: "existing-user", // Simulate that a user was found by the query.
    });

    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"])
      .send({ verificationCode: "123456" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Account already exists");

    findOneSpy.mockRestore();
  }, 10000);

  //   TEST: IF USER CREATION FAILED
  it("return 404 error code if user creation failed", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({
      user: {
        name: "Falode Tobi",
        email: "tobi12@gmail.com",
        password: "pass",
      },
      verificationCode: "123456",
    } as any);

    (User.findOne as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null); // checks if there is any user in db with findone (twice, existing, and after creation)

    // (User.create as jest.Mock).mockResolvedValue({}); // simulate user creation

    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"])
      .send({ verificationCode: "123456" });

    // console.log("BODY:", res.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Error Proccessing User");
  }, 10000);

  // TEST: USER IS CREATED SUCCESSFULY, SENTS A WELCOME EMAIL
  it("return a 201 success code if user is created successfully and welcome email sent", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({
      user: {
        name: "Falode Tobi",
        email: "tobi12@gmail.com",
        password: "pass",
      },
      verificationCode: "123456",
    } as any);

    (User.findOne as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        name: "Falode Tobi",
        email: "tobi12@gmail.com",
        password: "pass",
      });

    (User.create as jest.Mock).mockResolvedValue({});
    (sendMail as jest.Mock).mockResolvedValue({});

    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"])
      .send({ verificationCode: "123456" });

    // console.log("BODY:", res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Account Verification Successful!");
  }, 10000);

  // TEST: IF SEND MAIL HAS AN ERROR
  it("return 404 error code if sendMail has an error", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({
      user: {
        name: "Falode Tobi",
        email: "tobi12@gmail.com",
        password: "pass",
      },
      verificationCode: "123456",
    } as any);

    (User.findOne as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        name: "Falode Tobi",
        email: "tobi12@gmail.com",
        password: "pass",
      });

    (User.create as jest.Mock).mockResolvedValue({});
    (sendMail as jest.Mock).mockRejectedValue(new Error("Mail sending Failed"));

    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"])
      .send({ verificationCode: "123456" });

    // console.log("BODY:", res.body);

    expect(sendMail).toHaveBeenCalled();
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Mail sending Failed");
  }, 40000);
});
