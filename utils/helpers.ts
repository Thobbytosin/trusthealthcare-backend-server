import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

export const isPasswordStrong = (password: string) => {
  const passwordLength = password.trim().length;

  //   console.log("LENGTH:", password.trim().length);
  // check password strength
  const hasAlphabet = () => !!password.match(/[a-zA-Z]/);
  const hasNumber = () => !!password.match(/[0-9]/);

  // Password Test
  const passwordIsArbitrarilyStrongEnough =
    hasNumber() && hasAlphabet() && passwordLength >= 8;

  return passwordIsArbitrarilyStrongEnough;
};

export const isEmailValid: RegExp =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createVerificationToken = (user: any) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString(); // generates random 6 digit code

  const verificationToken = jwt.sign(
    { user, verificationCode },
    process.env.JWT_VERIFICATION_SECRET_KEY as string,
    { expiresIn: "5m" }
  );

  return { verificationCode, verificationToken };
};

export const createResetPasswordToken = (user: any) => {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const resetToken = jwt.sign(
    { user, resetCode },
    process.env.JWT_RESET_SECRET_KEY as string,
    { expiresIn: "4m" }
  );

  return { resetCode, resetToken };
};

// export const createNewVerificationToken = (user: any) => {
//   const verificationCode = Math.floor(
//     100000 + Math.random() * 900000
//   ).toString(); // generates random 6 digit code

//   const verificationToken = jwt.sign(
//     { user, verificationCode },
//     process.env.JWT_VERIFICATION_SECRET_KEY as string,
//     { expiresIn: "5m" }
//   );

//   return { verificationCode, verificationToken };
// };

export function add(a: number, b: number) {
  const answer = a + b;

  return answer;
}
