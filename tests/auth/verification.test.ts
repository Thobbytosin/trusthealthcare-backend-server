import { createTestApp } from "../../app-test";
import connectToDB from "../../utils/db";
import disconnectDB from "../../utils/disconnectDb";
import request from "supertest";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";

jest.mock("../../models/user.model.ts");

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
  });

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
  });

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
  });

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

    (User.findOne as jest.Mock).mockResolvedValue(null).mockResolvedValue(null); // checks if there is any user in db with findone (twice, existing, and after creation)

    // (User.create as jest.Mock).mockResolvedValue({}); // simulate user creation

    const res = await request(appTest)
      .post(endpoint)
      .set("Cookie", ["verification_token=fake-token"])
      .send({ verificationCode: "123456" });

    console.log("BODY:", res.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Error Proccessing User");
  });
});
