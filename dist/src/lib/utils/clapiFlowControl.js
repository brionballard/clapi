"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredOptionsMessage = exports.argumentDetailDescription = exports.availableOptionsMessage = exports.askForOptionMessage = exports.availableCommandsMessage = exports.askUserToConfirmSelectionContent = exports.askUserToSelectCommandContent = exports.askForName = exports.renameFileAndTryAgain = exports.handleDuplicateFileConflict = exports.searchForValidatorByConvention = exports.handleArgsAndExecute = exports.askForArg = exports.displayAvailableArgumentsAndDetails = exports.confirmSelection = exports.askUserToSelectCommand = exports.formatAndDisplayCommandSelections = exports.loadCommandValidators = exports.loadCommands = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const argHandler_1 = require("./argHandler");
const defaults_1 = require("./defaults");
const validatorNamePattern = '{filename}Validator';
// If the string explicitly contains the color code, it is used in the readline.Interface as a message.
const askUserToSelectCommandContent = `${logger_1.LoggerColors.FgYellow}1. Enter the number of a command: ${logger_1.LoggerColors.Reset} `;
exports.askUserToSelectCommandContent = askUserToSelectCommandContent;
const askUserToConfirmSelectionContent = `${logger_1.LoggerColors.FgYellow}2. Please confirm your selection of the {name} command [Y / N]: ${logger_1.LoggerColors.Reset} `;
exports.askUserToConfirmSelectionContent = askUserToConfirmSelectionContent;
const availableCommandsMessage = `Available commands: `;
exports.availableCommandsMessage = availableCommandsMessage;
const askForOptionMessage = `Enter value for {option}: `;
exports.askForOptionMessage = askForOptionMessage;
const availableOptionsMessage = `Here are the available arguments to choose from: `;
exports.availableOptionsMessage = availableOptionsMessage;
const argumentDetailDescription = `-- Description: {description}`;
exports.argumentDetailDescription = argumentDetailDescription;
const requiredOptionsMessage = `The following arguments are required: `;
exports.requiredOptionsMessage = requiredOptionsMessage;
/**
 * Load command files and build Command objects using file name and default exported function
 * If there is an error reading the path, log an error and exit the process.
 * If there is no commands found, log an error and exit the process.
 *
 * @param {string} dirPath
 * @param {string} ext - file type (.js | .ts) - defaults to .js
 * @return {Command[]}
 */
function loadCommands(dirPath, ext) {
    const extension = ext ?? '.js';
    if ((0, fs_1.existsSync)(dirPath)) {
        const rawPaths = (0, fs_1.readdirSync)(dirPath);
        return rawPaths
            .map((file) => {
            if (!file.includes('.d.')) {
                const commandPath = path_1.default.join(dirPath, file);
                try {
                    const imported = require(commandPath);
                    const func = imported.default;
                    const name = file.replace(extension, '');
                    const validator = imported?.Validator ?? searchForValidatorByConvention({ commandName: name, ext });
                    if (validator === undefined) {
                        throw new Error(`No validator found for ${name} command, excluding from Commands selection.`);
                    }
                    return { func, name, validator };
                }
                catch (error) {
                    throw new Error('Dynamic import failed.');
                }
            }
        }).filter((command) => command !== undefined);
    }
    else {
        (0, logger_1.logError)(logger_1.ErrorMsgs.InvalidCommandPathError(dirPath));
        process.exit(1);
    }
}
exports.loadCommands = loadCommands;
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
function loadCommandValidators(validatorDirPath, commands, ext) {
    ext = ext ?? '.js';
    if ((0, fs_1.existsSync)(validatorDirPath)) {
        commands.map((command) => {
            const exportedNameShouldBe = validatorNamePattern.replace('{filename}', command.name) + ext;
            const validatorPath = path_1.default.join(validatorDirPath, exportedNameShouldBe);
            if ((0, fs_1.existsSync)(validatorPath)) {
                command.validator = require(validatorPath).default;
            }
            else {
                const indexOfCommand = commands.indexOf(command);
                commands.splice(indexOfCommand, 1);
                // loadCommandValidators(validatorDirPath, commands);
            }
        });
        return commands;
    }
    else {
        (0, logger_1.logError)(logger_1.ErrorMsgs.InvalidValidatorsPathError(validatorDirPath));
        process.exit(1);
    }
}
exports.loadCommandValidators = loadCommandValidators;
/**
 * Search for command validator by convetion of {CommandName}Validator{.ts | .js}
 * @param {ValidatorSearchOptions} options
 * @return ValidatorOptions
 */
function searchForValidatorByConvention(options) {
    const validatorDirPath = options.validatorDirPath ?? path_1.default.join(__dirname, '..', '..', 'validators');
    const commandName = options.commandName;
    const ext = options.ext ?? '.js';
    const exportedNameShouldBe = validatorNamePattern.replace('{filename}', commandName) + ext;
    const validatorPath = path_1.default.join(validatorDirPath, exportedNameShouldBe);
    if ((0, fs_1.existsSync)(validatorPath)) {
        return require(validatorPath).default;
    }
    else {
        throw new Error(`Unable to locate ${exportedNameShouldBe} at ${validatorPath}`);
    }
}
exports.searchForValidatorByConvention = searchForValidatorByConvention;
/**
 * Format command names(from validator) as display options and render in terminal
 * @param {Command[]} commands
 */
function formatAndDisplayCommandSelections(commands) {
    const displayedOptions = commands.map((command, index) => `[${index}] ${command.validator.name}`);
    (0, logger_1.logGood)(availableCommandsMessage);
    displayedOptions.forEach((option) => (0, logger_1.logCustom)(logger_1.LoggerColors.FgCyan, option));
    console.log("\n");
}
exports.formatAndDisplayCommandSelections = formatAndDisplayCommandSelections;
/**
 * Prompt user to select a command
 * @param {Command[]} commands
 * @param {readline.Interface} rl
 */
function askUserToSelectCommand(commands, rl) {
    return new Promise((resolve, reject) => {
        rl.question(askUserToSelectCommandContent, (index) => {
            if (!isNaN(parseInt(index))) {
                const command = commands[parseInt(index)];
                if (command !== undefined) {
                    confirmSelection(commands, command, rl).then(() => resolve());
                }
                else {
                    console.log(`${logger_1.LoggerColors.FgRed}Invalid command${logger_1.LoggerColors.Reset}`);
                    askUserToSelectCommand(commands, rl).then(() => resolve());
                }
            }
            else {
                console.log(`${logger_1.LoggerColors.FgRed}Invalid selection${logger_1.LoggerColors.Reset}`);
                askUserToSelectCommand(commands, rl).then(() => resolve());
            }
        });
    });
}
exports.askUserToSelectCommand = askUserToSelectCommand;
/**
 * Confirm selection or start the process over again
 * @param {Command[]} commands
 * @param {Command} selected
 * @param {readline.Interface} rl
 */
function confirmSelection(commands, selected, rl) {
    return new Promise((resolve, reject) => {
        rl.question(askUserToConfirmSelectionContent.replace('{name}', selected.name), (ans) => {
            const confirmation = ans.toLowerCase();
            if (confirmation === 'y') {
                displayAvailableArgumentsAndDetails(selected);
                askForArg(selected, rl).then(() => resolve());
            }
            else {
                askUserToSelectCommand(commands, rl).then(() => resolve());
            }
        });
    });
}
exports.confirmSelection = confirmSelection;
/**
 * Display command requirements
 * @param {Command} command
 */
function displayAvailableArgumentsAndDetails(command) {
    (0, logger_1.logWarn)(availableOptionsMessage);
    const { required, available, argDetails } = command.validator;
    available.forEach((av) => {
        console.log(`- ${av}`);
        if (argDetails) {
            const detail = argDetails.find(det => det?.name === av);
            if (detail) {
                (0, logger_1.logGood)(argumentDetailDescription.replace('{description}', detail.description));
            }
        }
    });
    (0, logger_1.logError)(requiredOptionsMessage);
    required.forEach((req) => console.log(`- ${req}`));
}
exports.displayAvailableArgumentsAndDetails = displayAvailableArgumentsAndDetails;
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
function askForArg(command, rl, option, options) {
    const required = command.validator.required;
    let newOptions = options ?? [...command.validator.available];
    const currentOption = option ?? newOptions[0];
    const existsInAnswers = (ans) => ans.startsWith(currentOption);
    return new Promise((resolve, reject) => {
        rl.question(askForOptionMessage.replace('{option}', currentOption), (answer) => {
            // TODO: Ensure that input type can be treated as argDetail treated as. If not log message and ask for value again
            if (answer && answer !== '') {
                process.argv.push(`${currentOption}=${answer}`);
            }
            else {
                if (required.includes(currentOption) && !process.argv.some(existsInAnswers)) {
                    (0, logger_1.logError)(`${currentOption} is required.`);
                    askForArg(command, rl, currentOption).then(() => resolve());
                }
            }
            newOptions = newOptions.filter((op) => op !== currentOption);
            if (newOptions.length > 0) {
                askForArg(command, rl, newOptions[0], newOptions).then(() => resolve());
            }
            else {
                handleArgsAndExecute(command, rl);
            }
        });
    });
}
exports.askForArg = askForArg;
/**
 * Parse & validate args with argHandler then execute command
 * @param {Command} command
 * @param {readline.Interface} rl
 */
function handleArgsAndExecute(command, rl) {
    process.env.npm_lifecycle_event = `clapi:${command.validator.name}`;
    const args = (0, argHandler_1.getArgs)(command.validator); // parse args
    const processed = (0, defaults_1.loadConfigAndSetArgs)(args); // include ClapiMeta data
    executeCommand(command, processed, rl);
}
exports.handleArgsAndExecute = handleArgsAndExecute;
/**
 * Execute command default function.
 * @param {Command} command
 * @param {ParsedArgs} args
 * @param {readline.Interface} rl
 */
function executeCommand(command, args, rl) {
    command.func(args, rl);
}
/**
 * Handle the case when a file with the same name already exists.
 * @param {ParsedArgs<any>} args - Parsed arguments.
 * @param {string} filePath - Path to the existing file.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function handleDuplicateFileConflict(args, filePath, rl) {
    return new Promise((resolve, reject) => {
        rl.question(`${logger_1.LoggerColors.FgRed}The file ${filePath} already exists. Would you like to overwrite it? [Y/N] ${logger_1.LoggerColors.Reset}`, (ans) => {
            if (ans.toLowerCase() === 'y') {
                resolve(args);
            }
            else {
                renameFileAndTryAgain(args, rl).then((modifiedArgs) => resolve(modifiedArgs)).catch(reject);
            }
        });
    });
}
exports.handleDuplicateFileConflict = handleDuplicateFileConflict;
/**
 * Prompt user to rename the file and try again.
 * @param {ParsedArgs<any>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @returns {Promise<void>}
 */
function renameFileAndTryAgain(args, rl) {
    return new Promise((resolve, reject) => {
        rl.question('Would you like to rename the file you are currently generating? [Y/N] ', (ans) => {
            if (ans.toLowerCase() === 'y') {
                askForName(args, rl).then((modifiedArgs) => resolve(modifiedArgs)).catch(reject);
            }
            else {
                (0, logger_1.logError)('Closing due to naming conflict.');
                rl.close();
                reject();
            }
        });
    });
}
exports.renameFileAndTryAgain = renameFileAndTryAgain;
/**
 * Ask for name of file when renaming
 * @param {ParsedArgs<any>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 * @return {Promise<void>}
 */
function askForName(args, rl) {
    return new Promise((resolve, reject) => {
        rl.question('Please enter a new file name: ', (ans) => {
            if (ans === args.name) {
                (0, logger_1.logError)('Cannot be the same name.');
                askForName(args, rl).then((modifiedArgs) => resolve(modifiedArgs)).catch(reject);
            }
            else {
                if (ans !== '') {
                    const modifiedArgs = { ...args, name: ans };
                    resolve(modifiedArgs);
                }
                else {
                    (0, logger_1.logError)('Please enter a valid string.\n');
                    askForName(args, rl).then(resolve).catch(reject);
                }
            }
        });
    });
}
exports.askForName = askForName;
