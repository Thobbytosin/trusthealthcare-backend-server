let isDatabaseConnected = true;
let isRedisConnected = true;

export const setDatabaseConnected = (status: boolean) => {
  console.log("STATUS", status);
  isDatabaseConnected = status;
};

export const getDatabaseStatus = () => isDatabaseConnected;

export const setRedisConnected = (status: boolean) => {
  isRedisConnected = status;
  return isRedisConnected;
};

export const getRedisStatus = () => isRedisConnected;
