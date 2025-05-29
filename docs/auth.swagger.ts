const authSwagger = {
  "/auth/signup": {
    post: {
      summary: "Sign Up a User",
      operationId: "signUpUser",
      tags: ["Authentication"],
      parameters: [
        {
          in: "header",
          name: "x-cookie-consent",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "User's cookie consent object (used to determine if request is allowed)",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UserSignup",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Account Verification Code sent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example:
                      "A 6-digit verification code has been sent to your email address",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Requests",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missingFields: {
                  summary: "Missing required fields",
                  value: {
                    success: false,
                    message: "All fields are required",
                  },
                },
                invalidEmail: {
                  summary: "Invalid email format",
                  value: {
                    success: false,
                    message: "Please enter a valid email",
                  },
                },
                weakPassword: {
                  summary: "Weak password length",
                  value: {
                    success: false,
                    message: "Password security is too weak",
                  },
                },
                failedMail: {
                  summary: "Verification mail failed",
                  value: {
                    success: false,
                    message: "Falied to send verification mail",
                  },
                },
              },
            },
          },
        },
        409: {
          description: "Conflict",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example:
                      "Account already exists. Please proceed to sign in to your account",
                  },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/auth/account-verification": {
    post: {
      summary: "Verify User Account",
      operationId: "verifyAccount",
      tags: ["Authentication"],
      parameters: [
        {
          in: "header",
          name: "x-cookie-consent",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "User's cookie consent object (used to determine if request is allowed)",
        },
      ],
      security: [
        {
          cookieVerification: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AccountVerfification",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Account Verification Code sent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example:
                      "A 6-digit verification code has been sent to your email address",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Requests",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missingFields: {
                  summary: "Missing required fields",
                  value: {
                    success: false,
                    message: "All fields are required",
                  },
                },
                verifyingError: {
                  summary: "Error verifying user: Something went wrong",
                  value: {
                    success: false,
                    message: "Error verifying user: Something went wrong",
                  },
                },
                validatingError: {
                  summary: "Error validating your account. Try again",
                  value: {
                    success: false,
                    message: "Error validating your account. Try again",
                  },
                },
                failedSuccessMail: {
                  summary: "Verification success mail failed",
                  value: {
                    success: false,
                    message: "Falied to send verification success mail",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Verification code expired",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Verification code has expired",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Invalid Verification Token",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Access Denied: Invalid Verification code",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Account not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Error processing acocount: Account not found",
                  },
                },
              },
            },
          },
        },
        409: {
          description: "Conflict",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example:
                      "Account already exists. Please proceed to sign in to your account",
                  },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/auth/resend-verification-code": {
    post: {
      summary: "Resend verification code",
      operationId: "resend-verification-code",
      tags: ["Authentication"],
      parameters: [
        {
          in: "header",
          name: "x-cookie-consent",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "User's cookie consent object (used to determine if request is allowed)",
        },
      ],
      security: [
        {
          cookieVerification: [],
        },
      ],
      responses: {
        200: {
          description: "New account verification Code re-sent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example:
                      "A new 6-digit verification code has been re-sent to your email address",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Falied to re-send verification mail",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Falied to re-send verification mail",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "New Verification Token Issues",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missingOldVerfication: {
                  summary: "Old verification token expired",
                  value: {
                    success: false,
                    message: "Session has expired. Try Again",
                  },
                },
                sessionEnded: {
                  summary: "Old verification token expired",
                  value: {
                    success: false,
                    message: "Session has ended",
                  },
                },
                failedVerificationMail: {
                  summary: "Verification mail failed",
                  value: {
                    success: false,
                    message: "Falied to send verification mail",
                  },
                },
              },
            },
          },
        },
        409: {
          description: "Conflict",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example:
                      "Account already exists. Please proceed to sign in to your account",
                  },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
};

export default authSwagger;
