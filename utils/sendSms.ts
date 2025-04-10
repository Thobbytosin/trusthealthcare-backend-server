import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationSMS = async (to: string, code: string) => {
  const data = {
    to,
    from: "medicfunc",
    sms: `Welcome to Trust HealthCare: Your account verification code is ${code}`,
    api_key: process.env.TERMII_API_KEY,
    channel: "generic",
    type: "plain",
  };

  const options = {
    method: "POST",
    url: `${process.env.TERMI_BASE_URL}/api/sms/send`,
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };

  try {
    const response = await axios(options);
    // console.log("SUCCESS SENDING VERIFICATION SMS:", response.data); // Logs the response from Termii
  } catch (error: any) {
    console.error(
      "Error sending SMS:",
      error.response ? error.response.data : error.message
    );
  }
};
