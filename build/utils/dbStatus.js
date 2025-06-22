"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseStatus = exports.setDatabaseConnected = void 0;
let isDatabaseConnected = false;
const setDatabaseConnected = (status) => {
    isDatabaseConnected = status;
};
exports.setDatabaseConnected = setDatabaseConnected;
const getDatabaseStatus = () => isDatabaseConnected;
exports.getDatabaseStatus = getDatabaseStatus;
