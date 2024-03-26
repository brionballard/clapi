/// <reference types="node" />
import { Command, ParsedArgs, ValidatorOptions } from "../types";
import * as readline from "readline";
declare const askUserToSelectCommandContent: string;
declare const askUserToConfirmSelectionContent: string;
declare const availableCommandsMessage: string;
declare const askForOptionMessage: string;
declare const availableOptionsMessage: string;
declare const argumentDetailDescription: string;
declare const requiredOptionsMessage: string;
/**
 * Load command files and build Command objects using file name and default exported function
 * If there is an error reading the path, log an error and exit the process.
 * If there is no commands found, log an error and exit the process.
 *
 * @param {string} dirPath
 * @param {string} ext - file type (.js | .ts) - defaults to .js
 * @return {Command[]}
 */
declare function loadCommands(dirPath: string, ext?: string): Command[];
/**
 * Load validator files then extract validator object and set the validator property of respective Command
 * If there is an error reading the path, log an error and exit the process.
 * If there is no matching validator, remove the command form the commands array and recall the function.
 *
 * @param {string} validatorDirPath
 * @param {Command[]} commands
 * @param {string} ext - file type (.js | .ts) - defaults to .js
 * @return {Command[]}
 */
declare function loadCommandValidators(validatorDirPath: string, commands: Command[], ext?: string): Command[];
type ValidatorSearchOptions = {
    commandName: string;
    validatorDirPath?: string;
    ext?: string;
};
/**
 * Search for command validator by convetion of {CommandName}Validator{.ts | .js}
 * @param {ValidatorSearchOptions} options
 * @return ValidatorOptions
 */
declare function searchForValidatorByConvention(options: ValidatorSearchOptions): ValidatorOptions;
/**
 * Format command names(from validator) as display options and render in terminal
 * @param {Command[]} commands
 */
declare function formatAndDisplayCommandSelections(commands: Command[]): void;
/**
 * Prompt user to select a command
 * @param {Command[]} commands
 * @param {readline.Interface} rl
 */
declare function askUserToSelectCommand(commands: Command[], rl: readline.Interface): Promise<void>;
/**
 * Confirm selection or start the process over again
 * @param {Command[]} commands
 * @param {Command} selected
 * @param {readline.Interface} rl
 */
declare function confirmSelection(commands: Command[], selected: Command, rl: readline.Interface): Promise<void>;
/**
 * Display command requirements
 * @param {Command} command
 */
declare function displayAvailableArgumentsAndDetails(command: Command): void;
/**
 * Recursively ask user for single argument.
 * If required, re-ask
 * If not, ask for next argument.
 *
 * @param {Command} command
 * @param {readline.Interface} rl
 * @param {string | undefined} option
 * @param {string[] | undefined} options
 */
declare function askForArg(command: Command, rl: readline.Interface, option?: string, options?: string[]): Promise<void>;
/**
 * Parse & validate args with argHandler then execute command
 * @param {Command} command
 * @param {readline.Interface} rl
 */
declare function handleArgsAndExecute(command: Command, rl: readline.Interface): void;
/**
 * Handle the case when a file with the same name already exists.
 * @param {ParsedArgs<any>} args - Parsed arguments.
 * @param {string} filePath - Path to the existing file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
declare function handleDuplicateFileConflict(args: ParsedArgs<any>, filePath: string, rl: readline.Interface): Promise<ParsedArgs<any>>;
/**
 * Prompt user to rename the file and try again.
 * @param {ParsedArgs<any>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @returns {Promise<void>}
 */
declare function renameFileAndTryAgain(args: ParsedArgs<any>, rl: readline.Interface): Promise<ParsedArgs<any>>;
/**
 * Ask for name of file when renaming
 * @param {ParsedArgs<any>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
declare function askForName(args: ParsedArgs<any>, rl: readline.Interface): Promise<ParsedArgs<any>>;
export { loadCommands, loadCommandValidators, formatAndDisplayCommandSelections, askUserToSelectCommand, confirmSelection, displayAvailableArgumentsAndDetails, askForArg, handleArgsAndExecute, searchForValidatorByConvention, handleDuplicateFileConflict, renameFileAndTryAgain, askForName, askUserToSelectCommandContent, askUserToConfirmSelectionContent, availableCommandsMessage, askForOptionMessage, availableOptionsMessage, argumentDetailDescription, requiredOptionsMessage };
