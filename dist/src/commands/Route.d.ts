/// <reference types="node" />
import { type ExecutableCommand, type ParsedArgs, ValidatorOptions } from "../lib/types";
import * as readline from "readline";
/**
 * GenerateRouteFile - Command to generate a new route file.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
declare const GenerateRouteFile: ExecutableCommand;
/**
 * Get directory path of file
 * @param {ParsedArgs} args
 * @return {string}
 */
declare function getDirectory(args: ParsedArgs): string;
/**
 * Get file details from arguments
 * @param {ParsedArgs} args
 * @return {includeTypes: boolean, ext: string, fileName: string}
 */
declare function getFileDetails(args: ParsedArgs): {
    includeTypes: boolean;
    ext: string;
    fileName: string;
};
/**
 * Get extension based on the inclusion of argument "includeTypes"
 * @param {boolean} includeTypes
 * @return {'ts' | 'js'}
 */
declare function getExtension(includeTypes: boolean): 'ts' | 'js';
/**
 * Get opposite file type of argument instructions
 * @param {ParsedArgs} args
 * @param {string} ext
 * @return {string}
 */
declare function getOppositeFileName(args: ParsedArgs, ext: string): string;
/**
 * Get file contents - if include types, inject types
 * @param {boolean} includeTypes
 * @param {string} name
 * @return {string}
 */
declare function getRouteFileContents(includeTypes: boolean, name: string): string;
/**
 * Inject types into the contents of the route file.
 * @param {string} contents - Contents of the route file template.
 * @returns {string} - Contents with types injected.
 */
declare function injectTypesToContents(contents: string): string;
/**
 * Handle the case when a file with the same name already exists.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {string} filePath - Path to the existing file.
 * @param {string} contents - Contents of the new file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
declare function handleDuplicateFileConflict(args: ParsedArgs, filePath: string, contents: string, rl: readline.Interface): Promise<void>;
/**
 * Handle the case when a file with the same name but different extension exists.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {string} newPath - Path to the new file.
 * @param {string} oldPath - Path to the existing file with different extension.
 * @param {string} contents - Contents of the new file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
declare function handleSameFileNameWithDifferentExtensionExists(args: ParsedArgs, newPath: string, oldPath: string, contents: string, rl: readline.Interface): Promise<void>;
/**
 * Prompt user to rename the file and try again.
 * @param {ParsedArgs} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @returns {Promise<void>}
 */
declare function renameFileAndTryAgain(args: ParsedArgs, rl: readline.Interface): Promise<void>;
export default GenerateRouteFile;
export declare const Validator: ValidatorOptions;
export { getDirectory, getFileDetails, getExtension, getOppositeFileName, getRouteFileContents, injectTypesToContents, handleDuplicateFileConflict, handleSameFileNameWithDifferentExtensionExists, renameFileAndTryAgain };
