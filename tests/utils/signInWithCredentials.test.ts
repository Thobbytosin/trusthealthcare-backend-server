import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { configDotenv } from "dotenv";
import { signInWithCredentials } from "../../services/signIn.service";

configDotenv();

describe("signInWithCredentials", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let cookieMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    cookieMock = jest.fn();

    res = {
      status: statusMock,
      json: jsonMock,
      cookie: cookieMock,
    } as unknown as Response;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate and set access & refresh tokens in cookies", () => {
    const mockUser = { name: "John Doe", email: "johndoe@example.com" };

    jest.spyOn(jwt, "sign").mockImplementation((payload, secret, options) => {
      return secret === process.env.SIGN_IN_ACCESS_SECRET_KEY
        ? "mocked_access_token"
        : "mocked_refresh_token";
    });

    signInWithCredentials(
      200,
      res as Response,
      req as Request,
      next as NextFunction,
      mockUser
    );

    expect(cookieMock).toHaveBeenCalledTimes(2);

    expect(cookieMock).toHaveBeenCalledWith(
      "access_token",
      "mocked_access_token",
      expect.objectContaining({ httpOnly: true })
    );

    expect(cookieMock).toHaveBeenCalledWith(
      "refresh_token",
      "mocked_refresh_token",
      expect.objectContaining({ httpOnly: true })
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: "Logged in successfully",
      user: mockUser,
    });
  });
});
