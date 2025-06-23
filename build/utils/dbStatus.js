"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisStatus = exports.setRedisConnected = exports.getDatabaseStatus = exports.setDatabaseConnected = void 0;
let isDatabaseConnected = true;
let isRedisConnected = true;
const setDatabaseConnected = (status) => {
    console.log("STATUS", status);
    isDatabaseConnected = status;
};
exports.setDatabaseConnected = setDatabaseConnected;
const getDatabaseStatus = () => isDatabaseConnected;
exports.getDatabaseStatus = getDatabaseStatus;
const setRedisConnected = (status) => {
    isRedisConnected = status;
    return isRedisConnected;
};
exports.setRedisConnected = setRedisConnected;
const getRedisStatus = () => isRedisConnected;
exports.getRedisStatus = getRedisStatus;
