"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameFileAndTryAgain = exports.handleSameFileNameWithDifferentExtensionExists = exports.handleDuplicateFileConflict = exports.injectTypesToContents = exports.getRouteFileContents = exports.getOppositeFileName = exports.getExtension = exports.getFileDetails = exports.getDirectory = exports.Validator = void 0;
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../lib/utils/logger");
const RouteTemplate_1 = require("../templates/RouteTemplate");
const RouteValidator_1 = __importDefault(require("../validators/RouteValidator"));
// Load environment variables from .env file
(0, dotenv_1.config)();
/**
 * GenerateRouteFile - Command to generate a new route file.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
const GenerateRouteFile = (args, rl) => {
    const directory = getDirectory(args);
    const { includeTypes, ext, fileName } = getFileDetails(args);
    const oppositeFileName = getOppositeFileName(args, ext);
    const contents = getRouteFileContents(includeTypes, args.name);
    // Create directory if it doesn't exist
    if (!(0, fs_1.existsSync)(directory)) {
        (0, fs_1.mkdirSync)(directory);
    }
    // Construct full file paths
    const filePath = path_1.default.join(directory, fileName);
    const oppositePath = path_1.default.join(directory, oppositeFileName);
    // Check if exact file exists and if file with opposite extension exists
    const exactFileExist = (0, fs_1.existsSync)(filePath);
    const oppositeExtensionFileExists = (0, fs_1.existsSync)(oppositePath);
    if (exactFileExist) {
        void handleDuplicateFileConflict(args, filePath, contents, rl);
    }
    else if (oppositeExtensionFileExists) {
        void handleSameFileNameWithDifferentExtensionExists(args, filePath, oppositePath, contents, rl);
    }
    else {
        // No file exists, create a new file
        (0, fs_1.writeFileSync)(filePath, contents);
        (0, logger_1.logGood)(`${args.name} route file successfully created.`);
        rl.close();
    }
};
/**
 * Get directory path of file
 * @param {ParsedArgs} args
 * @return {string}
 */
function getDirectory(args) {
    const defaultDir = process.env.ROUTES_DIR && process.env.ROUTES_DIR !== '' ? process.env.ROUTES_DIR : 'src/routes';
    return args.hasOwnProperty('path') ? args.path : defaultDir;
}
exports.getDirectory = getDirectory;
/**
 * Get file details from arguments
 * @param {ParsedArgs} args
 * @return {includeTypes: boolean, ext: string, fileName: string}
 */
function getFileDetails(args) {
    const includeTypes = args.hasOwnProperty('includeTypes') && args.includeTypes.toLowerCase().trim() === 'true';
    const ext = getExtension(includeTypes);
    const fileName = `${args.name}.${ext}`;
    return { includeTypes, ext, fileName };
}
exports.getFileDetails = getFileDetails;
/**
 * Get extension based on the inclusion of argument "includeTypes"
 * @param {boolean} includeTypes
 * @return {'ts' | 'js'}
 */
function getExtension(includeTypes) {
    return includeTypes ? 'ts' : 'js';
}
exports.getExtension = getExtension;
/**
 * Get opposite file type of argument instructions
 * @param {ParsedArgs} args
 * @param {string} ext
 * @return {string}
 */
function getOppositeFileName(args, ext) {
    const oppositeExtension = ext === 'js' ? 'ts' : 'js';
    return `${args.name}.${oppositeExtension}`;
}
exports.getOppositeFileName = getOppositeFileName;
/**
 * Get file contents - if include types, inject types
 * @param {boolean} includeTypes
 * @param {string} name
 * @return {string}
 */
function getRouteFileContents(includeTypes, name) {
    const base = RouteTemplate_1.RouteTemplate.replace(/{name}/g, name);
    return includeTypes ? injectTypesToContents(base) : base;
}
exports.getRouteFileContents = getRouteFileContents;
/**
 * Inject types into the contents of the route file.
 * @param {string} contents - Contents of the route file template.
 * @returns {string} - Contents with types injected.
 */
function injectTypesToContents(contents) {
    // Define type imports
    const expressTypes = `import { type Router, type Request, type Response, type NextFunction } from "express";`;
    const customTypes = `import { type RouteFunction, type RouteOptions } from ""clapi-bb/dist/types"";`;
    // Define split point and replacement
    const splitContentsAt = ' = (router)';
    const replacementArg = 'options: RouteOptions';
    const replaceWith = ': RouteFunction = (router: Router): Router';
    // Replace 'req, res, next' with 'options: RouteOptions'
    contents = contents.replace(/(req, res, next)/g, replacementArg);
    contents = contents.replace(/next/g, 'options.next');
    // Find the index where to split the contents
    const splitIndex = contents.indexOf(splitContentsAt) + splitContentsAt.length;
    // Construct the updated contents with types injected
    return `${expressTypes}\n${customTypes}\n\n${contents.slice(0, splitIndex).replace(splitContentsAt, replaceWith)}${contents.slice(splitIndex)}`;
}
exports.injectTypesToContents = injectTypesToContents;
/**
 * Handle the case when a file with the same name already exists.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {string} filePath - Path to the existing file.
 * @param {string} contents - Contents of the new file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function handleDuplicateFileConflict(args, filePath, contents, rl) {
    (0, logger_1.logError)('This file already exists overwrite or rename file you want to generate');
    return new Promise((resolve, reject) => {
        rl.question(`The file ${filePath} already exists. Would you like to overwrite it? [Y/N]`, (ans) => {
            if (ans.toLowerCase() === 'y') {
                (0, fs_1.writeFileSync)(filePath, contents);
                (0, logger_1.logGood)(`${args.name} route file successfully created.`);
                resolve();
                rl.close();
            }
            else {
                renameFileAndTryAgain(args, rl).then(() => resolve());
            }
        });
    });
}
exports.handleDuplicateFileConflict = handleDuplicateFileConflict;
/**
 * Handle the case when a file with the same name but different extension exists.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {string} newPath - Path to the new file.
 * @param {string} oldPath - Path to the existing file with different extension.
 * @param {string} contents - Contents of the new file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function handleSameFileNameWithDifferentExtensionExists(args, newPath, oldPath, contents, rl) {
    (0, logger_1.logError)('A file with the same name but different extension exists in this directory!');
    return new Promise((resolve, reject) => {
        rl.question(`Would you like to overwrite it? [Y/N]`, (ans) => {
            if (ans.toLowerCase() === 'y') {
                // Move differentExtensionPath to inputPath
                (0, fs_1.rename)(oldPath, newPath, (err) => {
                    if (err) {
                        (0, logger_1.logError)('An unexpected error occurred while moving files. Shutting Clapi down, please try again.');
                        reject();
                        rl.close();
                    }
                    else {
                        (0, logger_1.logGood)('Successfully moved file.');
                        (0, fs_1.writeFileSync)(newPath, contents);
                        resolve();
                        (0, logger_1.logGood)(`${args.name} route file successfully created.`);
                        rl.close();
                    }
                });
            }
            else {
                renameFileAndTryAgain(args, rl).then(() => resolve());
            }
        });
    });
}
exports.handleSameFileNameWithDifferentExtensionExists = handleSameFileNameWithDifferentExtensionExists;
/**
 * Prompt user to rename the file and try again.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @returns {Promise<void>}
 */
function renameFileAndTryAgain(args, rl) {
    return new Promise((resolve, reject) => {
        rl.question('Would you like to rename the file you are currently generating? [Y/N]', (ans) => {
            if (ans.toLowerCase() === 'y') {
                askForName(args, rl).then(() => resolve());
            }
            else {
                (0, logger_1.logError)('Closing due to naming conflict.');
                rl.close();
            }
        });
    });
}
exports.renameFileAndTryAgain = renameFileAndTryAgain;
/**
 * Ask for name of file when renaming
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function askForName(args, rl) {
    return new Promise((resolve, reject) => {
        rl.question('Please enter a new file name: ', (ans) => {
            if (ans === args.name) {
                (0, logger_1.logError)('Cannot be the same name.');
                askForName(args, rl).then(() => resolve());
            }
            else {
                args.name = ans;
                GenerateRouteFile(args, rl);
                resolve();
            }
        });
    });
}
exports.default = GenerateRouteFile;
exports.Validator = RouteValidator_1.default;
