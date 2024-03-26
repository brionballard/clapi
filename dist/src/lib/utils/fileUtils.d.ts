/// <reference types="node" />
import readline from "readline";
declare function checkIfExists(path: string): boolean;
/**
 * Check if directory exists and create if not
 * @param {string} directory
 */
declare function checkAndCreate(directory: string): void;
/**
 * Create file
 * @param {string} filePath
 * @param {string} contents
 * @param {readline.Interface} rl
 */
declare function createFile(filePath: string, contents: string, rl: readline.Interface): void;
export { checkAndCreate, createFile, checkIfExists };
