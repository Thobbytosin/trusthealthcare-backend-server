import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/controllers", "<rootDir>/routes"], // Customize as needed
  moduleNameMapper: {
    "^@controllers/(.*)$": "<rootDir>/controllers/$1",
    "^@routes/(.*)$": "<rootDir>/routes/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
  },
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  clearMocks: true,
  verbose: true,
};

export default config;
