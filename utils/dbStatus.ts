let isDatabaseConnected = false;

export const setDatabaseConnected = (status: boolean) => {
  isDatabaseConnected = status;
};

export const getDatabaseStatus = () => isDatabaseConnected;
