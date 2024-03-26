import path from "path";
import * as readline from "readline";

import { type ArgDetail, type Command } from "../types";
import GenerateRouteFile from "../../commands/Route";
import * as logger from '../utils/logger';
import * as flowControl from "../utils/clapiFlowControl";
import {ErrorMsgs, logCustom, logError, LoggerColors, logGood, logWarn} from "../utils/logger";
import {existsSync, unlinkSync} from "fs";


const commandsDirPath: string = path.join(__dirname, '..', '..', 'commands');
const failableCommandsPath: string = path.join('src', 'commands');
const nonExistingCommandsPath: string = path.join(__dirname, '..', 'commands');
const commandValidatorsPath: string = path.join(__dirname, '..', '..', 'validators');
const nonExistingValidatorPath: string = path.join(__dirname, '..', 'validators');

// RouteObject after correctly processed as of 03/15/24
const RouteCommandObject: Command = {
    func: GenerateRouteFile,
    name: 'Route',
    validator: {
        maxArgs: 3,
        minArgs: 1,
        name: 'Create Route',
        available: [ 'name', 'path', 'includeTypes' ],
        required: [ 'name' ],
        argDetails: [
            {
                name: 'name',
                description: 'This will be used as the export function name and file name.',
                treatedAs: 'string'
            },
            {
                name: 'includeTypes',
                description: 'Include the opinionated types for a route file.',
                treatedAs: 'boolean'
            },
            {
                name: 'path',
                description: 'Setting a specific path will override the default value or the value set in the ENV file for route paths.',
                treatedAs: 'string'
            }
        ],
        description: 'The route command generates the boiler plate code for a API routes file. It will include the methods: GET(one), GET(many), POST, PUT, DELETE.'
    }
}

let rl: readline.Interface;
beforeEach(() => {
    // Mock the environment
    jest.spyOn(process, 'exit').mockImplementation();

    jest.spyOn(console, 'log').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test
    jest.spyOn(console, 'error').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test
    jest.spyOn(console, 'warn').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test


    jest.spyOn(logger, 'logError');
    jest.spyOn(logger, 'logWarn');
    jest.spyOn(logger, 'logGood');
    jest.spyOn(logger, 'logCustom');

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
});

afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
    rl.close();
});

describe('Should test the logic flow of Clapi', () => {
    it('Should load all commands', () => {
        const commands = flowControl.loadCommands(commandsDirPath, '.ts');
        expect(Array.isArray(commands)).toBe(true);
    });

    it('Should load all commands without explicit extension', () => {
        const commands = flowControl.loadCommands(commandsDirPath);
        expect(Array.isArray(commands)).toBe(true);
    });

    it('Should log an error if command dynamic import fails', () => {
        expect(() => {
            flowControl.loadCommands(failableCommandsPath, '.ts');
        }).toThrowError();
    });

    it('Should error out if command directory does not exists', () => {
        flowControl.loadCommands(nonExistingCommandsPath, '.ts');
        expect(logError).toHaveBeenCalledWith(ErrorMsgs.InvalidCommandPathError(nonExistingCommandsPath));
        expect(process.exit).toHaveBeenCalledWith(1)
    });

    it('Should set validators on the retrieved commands', () => {
       const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');

       expect(Array.isArray(commands)).toBe(true);

       const command: Command | undefined = commands.find(command => command.name.toLowerCase() === RouteCommandObject.name.toLowerCase());
       if (command === undefined) {
           throw new Error('Command undefined.');
       } else {
           expect(command.name).toBe(RouteCommandObject.name);
           expect(command.hasOwnProperty('validator')).toBe(true);

           if(command.validator === undefined) {
              throw new Error('Command validator undefined.');
           } else {
               expect(command.validator.maxArgs).toBe(3);
               expect(command.validator.minArgs).toBe(1);
               expect(command.validator.available.length).toBe(3);
               expect(command.validator.required.length).toBe(1);
               expect(Array.isArray(command.validator.argDetails)).toBe(true);
           }
       }
    });

    it('Should error out if validator directory does not exists', () => {
        const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        flowControl.loadCommandValidators(nonExistingValidatorPath, commands, '.ts');
        expect(logError).toHaveBeenCalledWith(ErrorMsgs.InvalidValidatorsPathError(nonExistingValidatorPath));
        expect(process.exit).toHaveBeenCalledWith(1)
    });

    it('Should console.log the command selections', () => {
        const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        flowControl.formatAndDisplayCommandSelections(commands);

        const shouldHaveBeenFormattedLike = commands.map((command, index) => `[${index}] ${command.validator.name}`);
        shouldHaveBeenFormattedLike.forEach((option: string) => expect(logCustom).toHaveBeenCalledWith(LoggerColors.FgCyan, option));
    });

    it('Should console.log each available argument & its description if it is has one.', () => {
        if(RouteCommandObject.validator === undefined) {
            throw new Error('Test data validator was not found.');
        }


        flowControl.displayAvailableArgumentsAndDetails(RouteCommandObject);
        expect(logWarn).toHaveBeenCalledWith(`Here are the available arguments to choose from: `);

        const {
            required,
            available,
            argDetails } = RouteCommandObject.validator;

        available.forEach((av: string): void => {
            expect(console.log).toHaveBeenCalledWith(`- ${av}`);

            if (argDetails) {
                const detail: ArgDetail | undefined = argDetails.find(det => det.name === av);

                if(detail) {
                    expect(logGood).toHaveBeenCalledWith(flowControl.argumentDetailDescription.replace('{description}', detail.description))
                }
            }
        });

        expect(logError).toHaveBeenCalledWith(flowControl.requiredOptionsMessage);
        required.forEach((req: string) => {
            expect(console.log).toHaveBeenCalledWith(`- ${req}`);
        });
    });
});

describe('Should test the logic flow of Clapi that depends on readline.Interface - i.e. prompting for user input', () => {
    it('Should ask the user to select a command', async () => {
        const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');

        // @ts-ignore
        const mockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('0'); // Assuming the user selects the first command
        });

         flowControl.askUserToSelectCommand(commands, rl);
        expect(mockQuestion).toHaveBeenCalledWith(flowControl.askUserToSelectCommandContent, expect.any(Function));
    });

    it('Should ask the user to select a command and get a invalid character as input', async () => {
        const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');

        // @ts-ignore
        const mockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('x'); // Assuming the user selects the first command
        });

        flowControl.askUserToSelectCommand(commands, rl);
        expect(mockQuestion).toHaveBeenCalledWith(flowControl.askUserToSelectCommandContent, expect.any(Function));
    });

    it('Should ask the user to select a command and get a invalid command index', async () => {
        const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');

        // @ts-ignore
        const mockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('3'); // Assuming the user selects the first command
        });

        flowControl.askUserToSelectCommand(commands, rl);
        expect(mockQuestion).toHaveBeenCalledWith(flowControl.askUserToSelectCommandContent, expect.any(Function));
    });

    it('Should ask the user to for confirmation', async () => {
        const commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');

        // @ts-ignore
        const mockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('0'); // Assuming the user selects the first command

            // @ts-ignore
            const secondMockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
                callback('Y');
            });
            expect(secondMockQuestion).toHaveBeenCalledWith(flowControl.askUserToConfirmSelectionContent.replace('{name}', RouteCommandObject.name), expect.any(Function));
        });

        flowControl.askUserToSelectCommand(commands, rl);
        expect(mockQuestion).toHaveBeenCalledWith(flowControl.askUserToSelectCommandContent, expect.any(Function));
    });

    it('Should display available arguments and their descriptions after confirming a command', async () => {
        let commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        commands = flowControl.loadCommandValidators(commandValidatorsPath, commands, '.ts');
        const command = RouteCommandObject;
        const displayAvailableArgs = jest.spyOn(flowControl, 'displayAvailableArgumentsAndDetails').mockImplementation((command: Command) => {});
        // @ts-ignore
        const secondMockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('Y');
        });

        flowControl.confirmSelection(commands, command, rl);
        flowControl.displayAvailableArgumentsAndDetails(command)
        if (command === undefined || command.validator === undefined) {
            throw new Error('Command not properly setup for test.')
        }

        expect(logWarn).toHaveBeenCalledWith(flowControl.availableOptionsMessage)

        const {
            required,
            available,
            argDetails } = command.validator;


        available.forEach((av: string): void => {
            expect(console.log).toHaveBeenCalledWith(`- ${av}`)

            if (argDetails) {
                const detail: ArgDetail | undefined = argDetails.find(det => det?.name === av);

                if(detail) {
                    expect(logGood).toHaveBeenCalledWith(flowControl.argumentDetailDescription.replace('{description}', detail.description));
                }
            }
        });

        expect(logError).toHaveBeenCalledWith(flowControl.requiredOptionsMessage);
        required.forEach((req: string) => {
            expect(console.log).toHaveBeenCalledWith(`- ${req}`);
        });

        expect(secondMockQuestion).toHaveBeenCalledWith(flowControl.askUserToConfirmSelectionContent.replace('{name}', RouteCommandObject.name), expect.any(Function));
        expect(displayAvailableArgs).toHaveBeenCalledWith(command)
    });

    it('Should re-ask user for selection', async () => {
        let commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        commands = flowControl.loadCommandValidators(commandValidatorsPath, commands, '.ts');
        const command = RouteCommandObject;

        // @ts-ignore
        const secondMockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('n');
            // @ts-ignore
            const mockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
                callback('0'); // Assuming the user selects the first command
            });

            expect(mockQuestion).toHaveBeenCalledWith(flowControl.askUserToSelectCommandContent, expect.any(Function));
        });

        flowControl.confirmSelection(commands, command, rl);
        expect(secondMockQuestion).toHaveBeenCalledWith(flowControl.askUserToConfirmSelectionContent.replace('{name}', RouteCommandObject.name), expect.any(Function));
    });

    it('Should re-prompt the user for argument value if value is not valid', () => {
        let commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        commands = flowControl.loadCommandValidators(commandValidatorsPath, commands, '.ts');
        const command = RouteCommandObject;

        if (command.validator === undefined) {
            throw new Error('Invalid command validator in test.');
        }
        const required: string[] = command.validator.required;
        const newOptions: string[] =[...command.validator.available];
        const option = newOptions[0];

        // @ts-ignore
        const askForArgWithInvalidValue = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('');
        });

        flowControl.askForArg(command, rl);
        // Should expect this twice
        expect(askForArgWithInvalidValue).toHaveBeenCalledWith(flowControl.askForOptionMessage.replace('{option}', option), expect.any(Function));
        expect(askForArgWithInvalidValue).toHaveBeenCalledWith(flowControl.askForOptionMessage.replace('{option}', option), expect.any(Function));
    });

    it('Should ask user for argument values', () => {
        let commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        commands = flowControl.loadCommandValidators(commandValidatorsPath, commands, '.ts');
        const command = RouteCommandObject;

        // @ts-ignore
        const mockQuestion = jest.spyOn(rl, 'question').mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
            callback('value'); // Assuming the user provides a value for 'name'
        });

        flowControl.askForArg(command, rl);

        expect(mockQuestion).toHaveBeenCalledWith(flowControl.askForOptionMessage.replace('{option}', 'name'), expect.any(Function));
        expect(process.argv).toContain('name=value');
    });

    it('Should execute command when user has provided options', async () => {
        let commands: Command[] = flowControl.loadCommands(commandsDirPath, '.ts');
        commands = flowControl.loadCommandValidators(commandValidatorsPath, commands, '.ts');
        const command = commands[0];

        const fileName = 'aFileNameThatDoesNotExists';
        const ext = '.ts';
        const expectCreatedFilePath = path.join(__dirname, '..', '..', 'routes', fileName + ext);

        jest.spyOn(rl, 'question')
            // @ts-ignore
            .mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
                callback(fileName); // name value for route command
            })
            // @ts-ignore
            .mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
                callback(''); // path value for route command
            })
            // @ts-ignore
            .mockImplementationOnce((_question: string, callback: (answer: string) => void) => {
                callback('true'); // includeTypes value for route command
            });

        flowControl.askForArg(command, rl);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(rl.question).toHaveBeenCalledWith(flowControl.askForOptionMessage.replace('{option}', 'name'), expect.any(Function));
        expect(rl.question).toHaveBeenCalledWith(flowControl.askForOptionMessage.replace('{option}', 'path'), expect.any(Function));
        expect(rl.question).toHaveBeenCalledWith(flowControl.askForOptionMessage.replace('{option}', 'includeTypes'), expect.any(Function));
        expect(logGood).toHaveBeenCalledWith(`${path.join('src', 'routes', fileName + ext)} file successfully created.`);
        expect(existsSync(expectCreatedFilePath)).toBe(true);
        unlinkSync(expectCreatedFilePath);
    });

    it('Should search for a specific command validator', () => {
        const validator = flowControl.searchForValidatorByConvention({
            commandName: 'Route',
            ext: '.ts'
        });

        expect(validator).toEqual(RouteCommandObject.validator);
    });

    it('Should throw an error searching for a specific command validator', () => {
        expect(() => {
            flowControl.searchForValidatorByConvention({
                commandName: 'Router',
                ext: '.ts'
            })
        }).toThrowError();
    });
});
