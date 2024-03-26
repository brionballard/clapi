import {logGood} from "./logger";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import readline from "readline";

function checkIfExists (path: string): boolean {
    return existsSync(path);
}
/**
 * Check if directory exists and create if not
 * @param {string} directory
 */
function checkAndCreate (directory: string): void {
    if (!checkIfExists(directory)) {
        mkdirSync(directory);
    }
}
/**
 * Create file
 * @param {string} filePath
 * @param {string} contents
 * @param {readline.Interface} rl
 */
function createFile (filePath: string, contents: string, rl: readline.Interface): void {
    writeFileSync(filePath, contents);
    logGood(`${filePath} file successfully created.`);
    rl.close();
}

export {
    checkAndCreate,
    createFile,
    checkIfExists
}
