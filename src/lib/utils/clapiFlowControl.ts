import {ArgDetail, Command, ParsedArgs, ValidatorOptions} from "../types";
import {existsSync, readdirSync} from "fs";
import path from "path";
import {ErrorMsgs, logCustom, logError, LoggerColors, logGood, logWarn} from "./logger";
import * as readline from "readline";
import {getArgs} from "./argHandler";

const validatorNamePattern: string = '{filename}Validator';

// If the string explicitly contains the color code, it is used in the readline.Interface as a message.
const askUserToSelectCommandContent: string = `${LoggerColors.FgYellow}1. Enter the number of a command: ${LoggerColors.Reset} `
const askUserToConfirmSelectionContent: string = `${LoggerColors.FgYellow}2. Please confirm your selection of the {name} command [Y / N]: ${LoggerColors.Reset} `;

const availableCommandsMessage: string = `Available commands: `;
const askForOptionMessage: string = `Enter value for {option}: `;
const availableOptionsMessage: string = `Here are the available arguments to choose from: `;
const argumentDetailDescription: string = `-- Description: {description}`;
const requiredOptionsMessage: string = `The following arguments are required: `;


/**
 * Load command files and build Command objects using file name and default exported function
 * If there is an error reading the path, log an error and exit the process.
 * If there is no commands found, log an error and exit the process.
 *
 * @param {string} dirPath
 * @param {string} ext - file type (.js | .ts) - defaults to .js
 * @return {Command[]}
 */
function loadCommands (dirPath: string, ext?: string): Command[] {
    const extension = ext ?? '.js'
    if (existsSync(dirPath)) {
        const rawPaths: string[] = readdirSync(dirPath);
        return rawPaths
            .map((file) => {
                if (!file.includes('.d.')) {
                    const commandPath: string = path.join(dirPath, file);
                    try {
                        const imported = require(commandPath);
                        const func = imported.default;
                        const name: string = file.replace(extension, '');

                        const validator = imported?.Validator ?? searchForValidatorByConvention({commandName: name, ext});

                        if (validator === undefined) {
                           throw new Error(`No validator found for ${name} command, excluding from Commands selection.`);
                        }

                        return { func, name, validator };
                    } catch (error: any) {
                        throw new Error('Dynamic import failed.');
                    }
                }
            }).filter((command: Command | undefined): command is Command => command !== undefined);
    } else {
        logError(ErrorMsgs.InvalidCommandPathError(dirPath));
        process.exit(1)
    }
}

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
function loadCommandValidators (validatorDirPath: string, commands: Command[], ext?: string): Command[] {
    ext = ext ?? '.js'
    if (existsSync(validatorDirPath)) {
        commands.map((command: Command): void => {
            const exportedNameShouldBe: string = validatorNamePattern.replace('{filename}', command.name) + ext;
            const validatorPath: string = path.join(validatorDirPath, exportedNameShouldBe);

            if (existsSync(validatorPath)) {
                command.validator = require(validatorPath).default;
            } else {
                const indexOfCommand: number = commands.indexOf(command);
                commands.splice(indexOfCommand, 1);
                loadCommandValidators(validatorDirPath, commands);
            }
        });

        return commands;
    } else {
        logError(ErrorMsgs.InvalidValidatorsPathError(validatorDirPath));
        process.exit(1)
    }
}

type ValidatorSearchOptions = { commandName: string, validatorDirPath?: string, ext?: string}
/**
 * Search for command validator by convetion of {CommandName}Validator{.ts | .js}
 * @param {ValidatorSearchOptions} options
 * @return ValidatorOptions
 */
function searchForValidatorByConvention (options: ValidatorSearchOptions): ValidatorOptions {
    const validatorDirPath: string = options.validatorDirPath ?? path.join(__dirname, '..', '..', 'validators');
    const commandName: string = options.commandName;
    const ext: string = options.ext ?? '.js';
    const exportedNameShouldBe: string = validatorNamePattern.replace('{filename}', commandName) + ext;
    const validatorPath: string = path.join(validatorDirPath, exportedNameShouldBe);

    if (existsSync(validatorPath)) {
        return require(validatorPath).default;
    } else {
        throw new Error(`Unable to locate ${exportedNameShouldBe} at ${validatorPath}`);
    }
}

/**
 * Format command names as display options and render in terminal
 * @param {Command[]} commands
 */
function formatAndDisplayCommandSelections (commands: Command[]): void {
    const displayedOptions = commands.map((command, index) => `[${index}] ${command.name}`);
    logGood(availableCommandsMessage);
    displayedOptions.forEach((option: string) => logCustom(LoggerColors.FgCyan, option))
}

/**
 * Prompt user to select a command
 * @param {Command[]} commands
 * @param {readline.Interface} rl
 */
function askUserToSelectCommand (commands: Command[], rl: readline.Interface): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        rl.question(askUserToSelectCommandContent, (index: string) => {
            if (!isNaN(parseInt(index))) {
                const command: Command = commands[parseInt(index)];

                if (command !== undefined) {
                    confirmSelection(commands, command, rl).then(() => resolve());
                } else {
                    console.log(`${LoggerColors.FgRed}Invalid command${LoggerColors.Reset}`);
                    askUserToSelectCommand(commands, rl).then(() => resolve());
                }
            } else {
                console.log(`${LoggerColors.FgRed}Invalid selection${LoggerColors.Reset}`);
                askUserToSelectCommand(commands, rl).then(() => resolve());
            }
        });
    });
}

/**
 * Confirm selection or start the process over again
 * @param {Command[]} commands
 * @param {Command} selected
 * @param {readline.Interface} rl
 */
function confirmSelection (commands: Command[], selected: Command, rl: readline.Interface): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        rl.question(askUserToConfirmSelectionContent.replace('{name}', selected.name), (ans: string) => {
            const confirmation: string = ans.toLowerCase();

            if(confirmation === 'y') {
                displayAvailableArgumentsAndDetails(selected)
                askForArg(selected, rl).then(() => resolve());
            } else {
                askUserToSelectCommand(commands, rl).then(() => resolve());
            }
        })
    });
}

/**
 * Display command requirements
 * @param {Command} command
 */
function displayAvailableArgumentsAndDetails (command: Command): void {
    logWarn(availableOptionsMessage);
    const {
        required,
        available,
        argDetails } = command.validator;


    available.forEach((av: string): void => {
        console.log(`- ${av}`);

        if (argDetails) {
            const detail: ArgDetail | undefined = argDetails.find(det => det?.name === av);

            if(detail) {
                logGood( argumentDetailDescription.replace('{description}', detail.description));
            }
        }
    });

    logError(requiredOptionsMessage);
    required.forEach((req: string) => console.log(`- ${req}`));
}

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
function askForArg (command: Command, rl: readline.Interface, option?: string, options?: string[]): Promise<void> {
    const required: string[] = command.validator.required;
    let newOptions: string[] = options ?? [...command.validator.available];
    const currentOption = option ?? newOptions[0];

    const existsInAnswers = (ans: string) => ans.startsWith(currentOption);

    return new Promise<void>((resolve, reject) => {
        rl.question(askForOptionMessage.replace('{option}', currentOption), (answer: string) => {
            // TODO: Ensure that input type can be treated as argDetail treated as. If not log message and ask for value again
            if (answer && answer !== '') {
                process.argv.push(`${currentOption}=${answer}`);
            } else {
                if (required.includes(currentOption) && !process.argv.some(existsInAnswers)) {
                    logError(`${currentOption} is required.`);
                    askForArg(command, rl, currentOption).then(() => resolve());
                }
            }

            newOptions = newOptions.filter((op) => op !== currentOption);
            if(newOptions.length > 0) {
                askForArg(command, rl, newOptions[0], newOptions).then(() => resolve());
            } else {
                handleArgsAndExecute(command, rl);
            }
        });
    });
}

/**
 * Parse & validate args with argHandler then execute command
 * @param {Command} command
 * @param {readline.Interface} rl
 */
function handleArgsAndExecute (command: Command, rl: readline.Interface): void {
    process.env.npm_lifecycle_event = `clapi:${command.validator.name}`;
    executeCommand(command, getArgs(command.validator), rl);
}

/**
 * Execute command default function.
 * @param {Command} command
 * @param {ParsedArgs} args
 * @param {readline.Interface} rl
 */
function executeCommand(command: Command, args: ParsedArgs, rl: readline.Interface): void {
    command.func(args, rl);
}

export {
    loadCommands,
    loadCommandValidators,
    formatAndDisplayCommandSelections,
    askUserToSelectCommand,
    confirmSelection,
    displayAvailableArgumentsAndDetails,
    askForArg,
    handleArgsAndExecute,
    searchForValidatorByConvention,

    // Messages
    askUserToSelectCommandContent,
    askUserToConfirmSelectionContent,
    availableCommandsMessage,
    askForOptionMessage,
    availableOptionsMessage,
    argumentDetailDescription,
    requiredOptionsMessage
}
