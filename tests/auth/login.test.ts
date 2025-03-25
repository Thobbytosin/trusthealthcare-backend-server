import { createTestApp } from "../../app-test";
import connectToDB from "../../utils/db";
import disconnectDB from "../../utils/disconnectDb";
import request from "supertest";

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

  //   TEST IF
});
