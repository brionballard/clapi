import { config } from "dotenv";
import { existsSync, mkdirSync, rename, writeFileSync } from "fs";
import path from "path";
import {type ExecutableCommand, type ParsedArgs, ValidatorOptions} from "../lib/types";
import { logError, logGood, logWarn } from "../lib/utils/logger";
import { RouteTemplate } from "../templates/RouteTemplate";
import * as readline from "readline";
import RouteValidator from "../validators/RouteValidator";

// Load environment variables from .env file
config();

/**
 * GenerateRouteFile - Command to generate a new route file.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
const GenerateRouteFile: ExecutableCommand = (args: ParsedArgs, rl: readline.Interface) => {
    const directory: string = getDirectory(args);
    const {includeTypes, ext, fileName} = getFileDetails(args);
    const oppositeFileName = getOppositeFileName(args, ext);

    const contents: string = getRouteFileContents(includeTypes, args.name);

    // Create directory if it doesn't exist
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }

    // Construct full file paths
    const filePath: string = path.join(directory, fileName);
    const oppositePath: string = path.join(directory, oppositeFileName);

    // Check if exact file exists and if file with opposite extension exists
    const exactFileExist: boolean = existsSync(filePath);
    const oppositeExtensionFileExists: boolean = existsSync(oppositePath);

    if (exactFileExist) {
        void handleDuplicateFileConflict(args, filePath, contents, rl);
    } else if (oppositeExtensionFileExists) {
        void handleSameFileNameWithDifferentExtensionExists(args, filePath, oppositePath, contents, rl);
    } else {
        // No file exists, create a new file
        writeFileSync(filePath, contents);
        logGood(`${args.name} route file successfully created.`);
        rl.close();
    }
}

/**
 * Get directory path of file
 * @param {ParsedArgs} args
 * @return {string}
 */
function getDirectory (args: ParsedArgs): string {
    const defaultDir: string = process.env.ROUTES_DIR && process.env.ROUTES_DIR !== '' ? process.env.ROUTES_DIR : 'src/routes';
   return args.hasOwnProperty('path') ? args.path : defaultDir;
}

/**
 * Get file details from arguments
 * @param {ParsedArgs} args
 * @return {includeTypes: boolean, ext: string, fileName: string}
 */
function getFileDetails (args: ParsedArgs): { includeTypes: boolean, ext: string, fileName: string } {
    const includeTypes: boolean = args.hasOwnProperty('includeTypes') && args.includeTypes.toLowerCase().trim() === 'true';
    const ext: 'ts' | 'js' = getExtension(includeTypes);
    const fileName: string = `${args.name}.${ext}`;

    return {includeTypes, ext, fileName}
}

/**
 * Get extension based on the inclusion of argument "includeTypes"
 * @param {boolean} includeTypes
 * @return {'ts' | 'js'}
 */
function getExtension (includeTypes: boolean): 'ts' | 'js' {
    return includeTypes ? 'ts' : 'js';
}

/**
 * Get opposite file type of argument instructions
 * @param {ParsedArgs} args
 * @param {string} ext
 * @return {string}
 */
function getOppositeFileName (args: ParsedArgs, ext: string): string {
    const oppositeExtension = ext === 'js' ? 'ts' : 'js';
    return `${args.name}.${oppositeExtension}`;
}

/**
 * Get file contents - if include types, inject types
 * @param {boolean} includeTypes
 * @param {string} name
 * @return {string}
 */
function getRouteFileContents (includeTypes: boolean, name: string): string {
    const base: string = RouteTemplate.replace(/{name}/g, name);

    return includeTypes ? injectTypesToContents(base) : base;
}

/**
 * Inject types into the contents of the route file.
 * @param {string} contents - Contents of the route file template.
 * @returns {string} - Contents with types injected.
 */
function injectTypesToContents(contents: string): string {
    // Define type imports
    const expressTypes: string = `import { type Router, type Request, type Response, type NextFunction } from "express";`
    const customTypes: string = `import { type RouteFunction, type RouteOptions } from "clapi-bb/dist/types";`

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

/**
 * Handle the case when a file with the same name already exists.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {string} filePath - Path to the existing file.
 * @param {string} contents - Contents of the new file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function handleDuplicateFileConflict(args: ParsedArgs, filePath: string, contents: string, rl: readline.Interface): Promise<void> {
    logError('This file already exists overwrite or rename file you want to generate');
    return new Promise<void>((resolve, reject) => {
        rl.question(`The file ${filePath} already exists. Would you like to overwrite it? [Y/N]`, (ans: string) => {
            if (ans.toLowerCase() === 'y') {
                writeFileSync(filePath, contents);
                logGood(`${args.name} route file successfully created.`)
                resolve();
                rl.close();
            } else {
                renameFileAndTryAgain(args, rl).then(() => resolve());
            }
        })
    });
}

/**
 * Handle the case when a file with the same name but different extension exists.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {string} newPath - Path to the new file.
 * @param {string} oldPath - Path to the existing file with different extension.
 * @param {string} contents - Contents of the new file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function handleSameFileNameWithDifferentExtensionExists(args: ParsedArgs, newPath: string, oldPath: string, contents: string, rl: readline.Interface): Promise<void> {
    logError('A file with the same name but different extension exists in this directory!');
    return new Promise<void>((resolve, reject) => {
        rl.question(`Would you like to overwrite it? [Y/N]`, (ans: string) => {
            if (ans.toLowerCase() === 'y') {
                // Move differentExtensionPath to inputPath
                rename(oldPath, newPath, (err) => {
                    if (err) {
                        logError('An unexpected error occurred while moving files. Shutting Clapi down, please try again.');
                        reject();
                        rl.close();
                    } else {
                        logGood('Successfully moved file.');
                        writeFileSync(newPath, contents);
                        resolve();
                        logGood(`${args.name} route file successfully created.`)
                        rl.close();
                    }
                });
            } else {
                renameFileAndTryAgain(args, rl).then(() => resolve());
            }
        });
    });
}

/**
 * Prompt user to rename the file and try again.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @returns {Promise<void>}
 */
function renameFileAndTryAgain(args: ParsedArgs, rl: readline.Interface): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        rl.question('Would you like to rename the file you are currently generating? [Y/N]', (ans: string) => {
            if (ans.toLowerCase() === 'y') {
                askForName(args, rl).then(() => resolve());
            } else {
                logError('Closing due to naming conflict.');
                rl.close();
            }
        });
    });
}

/**
 * Ask for name of file when renaming
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function askForName (args: ParsedArgs, rl: readline.Interface): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        rl.question('Please enter a new file name: ', (ans: string) => {
            if (ans === args.name) {
                logError('Cannot be the same name.');
                askForName(args, rl).then(() => resolve());
            } else {
                args.name = ans;
                GenerateRouteFile(args, rl);
                resolve();
            }
        });
    })
}
export default GenerateRouteFile;
export const Validator = RouteValidator;
export {
    getDirectory,
    getFileDetails,
    getExtension,
    getOppositeFileName,
    getRouteFileContents,
    injectTypesToContents,
    handleDuplicateFileConflict,
    handleSameFileNameWithDifferentExtensionExists,
    renameFileAndTryAgain
}
