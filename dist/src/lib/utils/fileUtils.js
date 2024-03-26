"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfExists = exports.createFile = exports.checkAndCreate = void 0;
const logger_1 = require("./logger");
const fs_1 = require("fs");
function checkIfExists(path) {
    return (0, fs_1.existsSync)(path);
}
exports.checkIfExists = checkIfExists;
/**
 * Check if directory exists and create if not
 * @param {string} directory
 */
function checkAndCreate(directory) {
    if (!checkIfExists(directory)) {
        (0, fs_1.mkdirSync)(directory);
    }
}
exports.checkAndCreate = checkAndCreate;
/**
 * Create file
 * @param {string} filePath
 * @param {string} contents
 * @param {readline.Interface} rl
 */
function createFile(filePath, contents, rl) {
    (0, fs_1.writeFileSync)(filePath, contents);
    (0, logger_1.logGood)(`${filePath} file successfully created.`);
    rl.close();
}
exports.createFile = createFile;
