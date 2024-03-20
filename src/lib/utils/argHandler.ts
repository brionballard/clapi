import {type ParsedArgs, type ValidatorOptions} from "../types";
import {ErrorMsgs, logError} from "./logger";

/**
 * Gets the user input arguments.
 * @param {ValidatorOptions} validatorOptions
 * @returns {ParsedArgs} The user input arguments as an object
 */
function getArgs (validatorOptions: ValidatorOptions): ParsedArgs {
    const raw: string[] = getSlicedRawArgs();
    const args: ParsedArgs = parseArgsArrayToObject(raw);

    validateArguments(args, validatorOptions);

    return args;
}

/**
 * Get the raw arguments without the first two items
 * @return {string[]}
 */
function getSlicedRawArgs(): string[] {
    return process.argv.slice(2);
}

/**
 * Validate that the current command is valid
 * for the library, if not, exit the process.
 */
function validateNpmLifeCycleAndReturnLifeCycleString (): string {
    const npmLifecycleEvent: string | undefined = process.env.npm_lifecycle_event;

    if (!npmLifecycleEvent || !npmLifecycleEvent.startsWith('clapi')) {
        logError(ErrorMsgs.InvalidKeyword());
        process.exit(1);
    }

    return npmLifecycleEvent.split('clapi:').join('').trim();
}

/**
 * Parse array of args to an object.
 * @param {string[]} args
 * @return {ParsedArgs}
 */
function parseArgsArrayToObject (args: string[]): ParsedArgs {
    const options: ParsedArgs = {};

    args.forEach(arg => {
        const [key, value] = arg.split('=');
        options[key] = value;
    });

    return options;
}

/**
 * Validates the given arguments for the command or log an error and exit the process
 * @param {ParsedArgs} args
 * @param {ValidatorOptions} options
 */
function validateArguments(args: ParsedArgs, options: ValidatorOptions): void {
    const {
        maxArgs,
        minArgs,
        name,
        required,
        available, } = options;

    const argKeys: string[] = Object.keys(args);

    checkMaxArguments(argKeys.length, maxArgs, name);
    checkMinArguments(argKeys.length, minArgs, name);
    checkProvidedCommandModifierName(name);
    checkForIllegalArguments(argKeys, available);
    checkForRequiredArguments(argKeys, required);
}

/**
 * Checks if the number of received arguments exceeds the maximum allowed.
 * If so, logs an error message and exits the process.
 * @param {number} received - The number of received arguments.
 * @param {number} max - The maximum allowed number of arguments.
 * @param {string} commandName - The name of the command.
 */
function checkMaxArguments(received: number, max: number, commandName: string): void {
    if (received > max) {
        logError(ErrorMsgs.MaxArgumentExceeded(commandName, max));
        process.exit(1);
    }
}

/**
 * Checks if the number of received arguments is less than the minimum required.
 * If so, logs an error message and exits the process.
 * @param {number} received - The number of received arguments.
 * @param {number} min - The minimum required number of arguments.
 * @param {string} commandName - The name of the command.
 */
function checkMinArguments(received: number, min: number, commandName: string): void {
    if (received < min) {
        logError(ErrorMsgs.MinArgumentExceeded(commandName, min));
        process.exit(1);
    }
}

/**
 * Checks if the provided command modifier name matches the expected command name.
 * If not, logs an error message and exits the process.
 * @param {string} commandName - The expected command name.
 */
function checkProvidedCommandModifierName(commandName: string): void {
    const providedName: string | undefined = validateNpmLifeCycleAndReturnLifeCycleString();

    if (providedName !== commandName) {
        logError(ErrorMsgs.InvalidModifierName(providedName, commandName));
        process.exit(1);
    }
}


/**
 * Check if user provided args contain illegal arguments. If so, log error and exit process.
 * @param {string[]} received - array of strings we are inspecting
 * @param {string[]} legal - array of legal arguments
 * @return {void}
 */
function checkForIllegalArguments (received: string[], legal: string[]): void {
    const invalid: (string | undefined)[] = received.map((key: string) => {
        return legal.includes(key) ? undefined : key;
    }).filter(item => item !== undefined);

    if (invalid.length > 0) {
        logError(ErrorMsgs.IllegalCommandArguments(received, legal));
        process.exit(1)
    }
}

/**
 * Ensure that received arguments meet the required arguments
 * If not, log error and exit process.
 * @param {string[]} received - array of strings we are inspecting
 * @param {string[]} required - array of legal arguments
 * @return {void}
 */
function checkForRequiredArguments (received: string[], required: string[]): void {
    const missing: string[] = [];

    required.map((req: string) => {
        if (!received.includes(req)) {
            missing.push(req)
        }
    });

    if(missing.length > 0) {
        logError(ErrorMsgs.MissingRequiredArguments(received, required, missing));
        process.exit(1)
    }
}

export {
    getArgs,
    parseArgsArrayToObject,
    validateNpmLifeCycleAndReturnLifeCycleString,
    getSlicedRawArgs,
    validateArguments,
    checkMaxArguments,
    checkMinArguments,
    checkProvidedCommandModifierName,
    checkForIllegalArguments,
    checkForRequiredArguments
}


