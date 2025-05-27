const userSwagger = {
  "/user/me": {
    get: {
      summary: "Get Logged-in User's data",
      operationId: "getLoggedInUser",
      tags: ["User"],
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
          cookieAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Success - Returns user data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  user: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "647bf9e1b5fba927a8c8e123",
                      },
                      name: {
                        type: "string",
                        example: "John Doe",
                      },
                      email: {
                        type: "string",
                        format: "email",
                        example: "john.doe@example.com",
                      },
                      role: {
                        type: "string",
                        enum: ["user", "patient", "doctor", "admin"],
                        example: "user",
                      },
                      signedInAs: {
                        type: "string",
                        enum: ["user", "doctor"],
                        example: "user",
                      },
                      doctorId: {
                        type: "",
                        example: null,
                      },
                      lastLogin: {
                        type: "string",
                        format: "date-time",
                        example: "2024-01-01T00:00:00.000Z",
                      },
                      lastPasswordReset: {
                        type: "string",
                        format: "date-time",
                        example: "2024-01-01T00:00:00.000Z",
                      },
                      verified: {
                        type: "boolean",
                        example: true,
                      },
                      avatar: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            example: "tsttw612ww778w8w7ww",
                          },
                          url: {
                            type: "string",
                            example:
                              "https://res.cloudinary.com/sddfgalop/image/upload/v1744710788/trusthealthcare/user/John%20Doe/5tsttw612ww778w8w7ww.png",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Token Issues",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missingToken: {
                  summary: "Missing token",
                  value: {
                    success: false,
                    message: "Unauthorized: Authentication token required",
                  },
                },
                expiredToken: {
                  summary: "Expired token",
                  value: {
                    success: false,
                    message: "Unauthorized: Invalid authentication token",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "User Account Not Found",
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
                    example: "Not Found: User Account does not exist",
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

export default userSwagger;
