import { type ParsedArgs, type ValidatorOptions } from "../types";
/**
 * Gets the user input arguments.
 * @param {ValidatorOptions} validatorOptions
 * @returns {ParsedArgs<any>} The user input arguments as an object
 */
declare function getArgs(validatorOptions: ValidatorOptions): ParsedArgs<any>;
/**
 * Get the raw arguments without the first two items
 * @return {string[]}
 */
declare function getSlicedRawArgs(): string[];
/**
 * Validate that the current command is valid
 * for the library, if not, exit the process.
 * @return {string}
 */
declare function validateNpmLifeCycleAndReturnLifeCycleString(): string;
/**
 * Parse array of args to an object.
 * @param {string[]} args
 * @param {ValidatorOptions} validator
 * @return {ParsedArgs<any>}
 */
declare function parseArgsArrayToObject(args: string[], validator: ValidatorOptions): ParsedArgs<any>;
/**
 * Validates the given arguments for the command or log an error and exit the process
 * @param {ParsedArgs<any>} args
 * @param {ValidatorOptions} options
 */
declare function validateArguments(args: ParsedArgs<any>, options: ValidatorOptions): void;
/**
 * Checks if the number of received arguments exceeds the maximum allowed.
 * If so, logs an error message and exits the process.
 * @param {number} received - The number of received arguments.
 * @param {number} max - The maximum allowed number of arguments.
 * @param {string} commandName - The name of the command.
 */
declare function checkMaxArguments(received: number, max: number, commandName: string): void;
/**
 * Checks if the number of received arguments is less than the minimum required.
 * If so, logs an error message and exits the process.
 * @param {number} received - The number of received arguments.
 * @param {number} min - The minimum required number of arguments.
 * @param {string} commandName - The name of the command.
 */
declare function checkMinArguments(received: number, min: number, commandName: string): void;
/**
 * Checks if the provided command modifier name matches the expected command name.
 * If not, logs an error message and exits the process.
 * @param {string} commandName - The expected command name.
 */
declare function checkProvidedCommandModifierName(commandName: string): void;
/**
 * Check if user provided args contain illegal arguments. If so, log error and exit process.
 * @param {string[]} received - array of strings we are inspecting
 * @param {string[]} legal - array of legal arguments
 * @return {void}
 */
declare function checkForIllegalArguments(received: string[], legal: string[]): void;
/**
 * Ensure that received arguments meet the required arguments
 * If not, log error and exit process.
 * @param {string[]} received - array of strings we are inspecting
 * @param {string[]} required - array of legal arguments
 * @return {void}
 */
declare function checkForRequiredArguments(received: string[], required: string[]): void;
export { getArgs, parseArgsArrayToObject, validateNpmLifeCycleAndReturnLifeCycleString, getSlicedRawArgs, validateArguments, checkMaxArguments, checkMinArguments, checkProvidedCommandModifierName, checkForIllegalArguments, checkForRequiredArguments };
