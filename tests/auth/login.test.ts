import { createTestApp } from "../../app-test";
import User from "../../models/user.model";
import connectToDB from "../../utils/db";
import disconnectDB from "../../utils/disconnectDb";
import request from "supertest";
import bcryptjs from "bcryptjs";

jest.mock("../../models/user.model.ts");

describe("POST /api/v1/login", () => {
  const endpoint = "/api/v1/login";
  let appTest: any;

  beforeAll(async () => {
    appTest = createTestApp();

    await connectToDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  //   TEST: IF BODY IS EMPTY
  it("return 403 error code if request body is empty", async () => {
    const res = await request(appTest).post(endpoint).send({});

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("All fields are required");
  });

  // TEST: IF USER ENTERS ONLY EITHER OF EMAIL OR PASSWORD
  it("return 403 error code if user enters only one of email or password", async () => {
    const res = await request(appTest).post(endpoint).send({ password: 1234 });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("All fields are required");
  });

  //   TEST IF ACCOUNT EXISTS
  it("return 404 error code if account is not found", async () => {
    jest.spyOn(User, "findOne").mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(null),
    } as any);

    const res = await request(appTest)
      .post(endpoint)
      .send({ email: "test@gmail.com", password: "123456" });

    // console.log(res.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Account not found");
  });

  //   TEST: IF PASSWORD IS CORRECT
  it("return 404 error code if the password is not correct", async () => {
    const mockUserInDB = {
      email: "test@gmail.com",
      password: bcryptjs.hashSync("123456", 10),
    };
    jest.spyOn(User, "findOne").mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(mockUserInDB),
    } as any);

    const res = await request(appTest)
      .post(endpoint)
      .send({ email: "test@gmail.com", password: "wrongpass" });

    // console.log(res.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Invalid credentials");
  });

  //   TEST: USER LOGINS
  it("rerurns 200 success code if user logs in", async () => {
    const mockUserInDB = {
      email: "test@gmail.com",
      password: bcryptjs.hashSync("123456", 10),
      save: jest.fn(),
    };
    jest.spyOn(User, "findOne").mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(mockUserInDB),
    } as any);

    const res = await request(appTest)
      .post(endpoint)
      .send({ email: "test@gmail.com", password: "123456" });

    // console.log(res.body);

    expect(res.status).toBe(200);
    expect(mockUserInDB.save).toHaveBeenCalled();
  });
});
