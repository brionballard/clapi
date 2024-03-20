"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForRequiredArguments = exports.checkForIllegalArguments = exports.checkProvidedCommandModifierName = exports.checkMinArguments = exports.checkMaxArguments = exports.validateArguments = exports.getSlicedRawArgs = exports.validateNpmLifeCycleAndReturnLifeCycleString = exports.parseArgsArrayToObject = exports.getArgs = void 0;
const logger_1 = require("./logger");
/**
 * Gets the user input arguments.
 * @param {ValidatorOptions} validatorOptions
 * @returns {ParsedArgs} The user input arguments as an object
 */
function getArgs(validatorOptions) {
    const raw = getSlicedRawArgs();
    const args = parseArgsArrayToObject(raw);
    validateArguments(args, validatorOptions);
    return args;
}
exports.getArgs = getArgs;
/**
 * Get the raw arguments without the first two items
 * @return {string[]}
 */
function getSlicedRawArgs() {
    return process.argv.slice(2);
}
exports.getSlicedRawArgs = getSlicedRawArgs;
/**
 * Validate that the current command is valid
 * for the library, if not, exit the process.
 */
function validateNpmLifeCycleAndReturnLifeCycleString() {
    const npmLifecycleEvent = process.env.npm_lifecycle_event;
    if (!npmLifecycleEvent || !npmLifecycleEvent.startsWith('clapi')) {
        (0, logger_1.logError)(logger_1.ErrorMsgs.InvalidKeyword());
        process.exit(1);
    }
    return npmLifecycleEvent.split('clapi:').join('').trim();
}
exports.validateNpmLifeCycleAndReturnLifeCycleString = validateNpmLifeCycleAndReturnLifeCycleString;
/**
 * Parse array of args to an object.
 * @param {string[]} args
 * @return {ParsedArgs}
 */
function parseArgsArrayToObject(args) {
    const options = {};
    args.forEach(arg => {
        const [key, value] = arg.split('=');
        options[key] = value;
    });
    return options;
}
exports.parseArgsArrayToObject = parseArgsArrayToObject;
/**
 * Validates the given arguments for the command or log an error and exit the process
 * @param {ParsedArgs} args
 * @param {ValidatorOptions} options
 */
function validateArguments(args, options) {
    const { maxArgs, minArgs, name, required, available, } = options;
    const argKeys = Object.keys(args);
    checkMaxArguments(argKeys.length, maxArgs, name);
    checkMinArguments(argKeys.length, minArgs, name);
    checkProvidedCommandModifierName(name);
    checkForIllegalArguments(argKeys, available);
    checkForRequiredArguments(argKeys, required);
}
exports.validateArguments = validateArguments;
/**
 * Checks if the number of received arguments exceeds the maximum allowed.
 * If so, logs an error message and exits the process.
 * @param {number} received - The number of received arguments.
 * @param {number} max - The maximum allowed number of arguments.
 * @param {string} commandName - The name of the command.
 */
function checkMaxArguments(received, max, commandName) {
    if (received > max) {
        (0, logger_1.logError)(logger_1.ErrorMsgs.MaxArgumentExceeded(commandName, max));
        process.exit(1);
    }
}
exports.checkMaxArguments = checkMaxArguments;
/**
 * Checks if the number of received arguments is less than the minimum required.
 * If so, logs an error message and exits the process.
 * @param {number} received - The number of received arguments.
 * @param {number} min - The minimum required number of arguments.
 * @param {string} commandName - The name of the command.
 */
function checkMinArguments(received, min, commandName) {
    if (received < min) {
        (0, logger_1.logError)(logger_1.ErrorMsgs.MinArgumentExceeded(commandName, min));
        process.exit(1);
    }
}
exports.checkMinArguments = checkMinArguments;
/**
 * Checks if the provided command modifier name matches the expected command name.
 * If not, logs an error message and exits the process.
 * @param {string} commandName - The expected command name.
 */
function checkProvidedCommandModifierName(commandName) {
    const providedName = validateNpmLifeCycleAndReturnLifeCycleString();
    if (providedName !== commandName) {
        (0, logger_1.logError)(logger_1.ErrorMsgs.InvalidModifierName(providedName, commandName));
        process.exit(1);
    }
}
exports.checkProvidedCommandModifierName = checkProvidedCommandModifierName;
/**
 * Check if user provided args contain illegal arguments. If so, log error and exit process.
 * @param {string[]} received - array of strings we are inspecting
 * @param {string[]} legal - array of legal arguments
 * @return {void}
 */
function checkForIllegalArguments(received, legal) {
    const invalid = received.map((key) => {
        return legal.includes(key) ? undefined : key;
    }).filter(item => item !== undefined);
    if (invalid.length > 0) {
        (0, logger_1.logError)(logger_1.ErrorMsgs.IllegalCommandArguments(received, legal));
        process.exit(1);
    }
}
exports.checkForIllegalArguments = checkForIllegalArguments;
/**
 * Ensure that received arguments meet the required arguments
 * If not, log error and exit process.
 * @param {string[]} received - array of strings we are inspecting
 * @param {string[]} required - array of legal arguments
 * @return {void}
 */
function checkForRequiredArguments(received, required) {
    const missing = [];
    required.map((req) => {
        if (!received.includes(req)) {
            missing.push(req);
        }
    });
    if (missing.length > 0) {
        (0, logger_1.logError)(logger_1.ErrorMsgs.MissingRequiredArguments(received, required, missing));
        process.exit(1);
    }
}
exports.checkForRequiredArguments = checkForRequiredArguments;
