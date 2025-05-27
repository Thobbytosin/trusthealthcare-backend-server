import paths from "../docs";

const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Trust Healthcare API",
    version: "1.0.0",
    description:
      "API for medical appointment booking, doctor availability, patient management, and more.",
    contact: {
      name: "Trust Healthcare Team",
      email: "support@trusthealthcare.com",
      url: "https://trusthealthcare.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:8000/api/v1",
      description: "Version 1.0 Local development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "JWT access token stored in cookies",
      },
      cookieRefresh: {
        type: "apiKey",
        in: "cookie",
        name: "refresh_token",
        description: "JWT refresh token stored in cookies",
      },
      cookieVerification: {
        type: "apiKey",
        in: "cookie",
        name: "verification_token",
        description: "JWT verification token stored in cookies",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "An error message explaining what went wrong.",
          },
        },
      },
      UserSignup: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "SecurePassword123!",
          },
        },
      },
      AccountVerfification: {
        type: "object",
        required: ["verificationCode"],
        properties: {
          verificationCode: {
            type: "string",
            example: "000000",
          },
        },
      },
    },
    responses: {
      InternalServerError: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              success: false,
              message: "Something went wrong. Please try again later.",
            },
          },
        },
      },
    },
  },
  paths,
};

export default swaggerConfig;
