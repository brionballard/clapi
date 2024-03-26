// Test coverage of this test may be a bit odd due to the way readline is tested.
// Avoided creating mocks of fs and multiple functions and focused on interacting
// with readline.Interface as the user would.
import {Command, ParsedArgs} from "../types";
import readline from "readline";
import {getArgs} from "../utils/argHandler";
import GenerateRouteFile, * as rc from "../../commands/Route";
import * as logger from "../utils/logger";
import {logError, LoggerColors, logGood} from "../utils/logger";
import {existsSync, rm} from "fs";
import {DEFAULT_DIRS, CONF_PROPS, getDefaultDirectory} from "../utils/defaults";
import {handleDuplicateFileConflict} from "../utils/clapiFlowControl";

const RouteCommandObject: Command = {
    func: GenerateRouteFile,
    name: 'Route',
    validator: {
        maxArgs: 3,
        minArgs: 1,
        name: 'route',
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

function getReadlineInterface () {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}


const rawArgs = [
    'name=test'
];
const defaultRouteDir = 'src/routes'

describe('Test route command execution', () => {
    let command: Command;
    let args: ParsedArgs<any>;

    beforeEach(() => {
        if (RouteCommandObject.validator === undefined) {
            throw new Error('Command validator is undefined');
        }

        jest.spyOn(process, 'exit').mockImplementation();
        jest.spyOn(console, 'log').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test
        jest.spyOn(console, 'error').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test
        jest.spyOn(console, 'warn').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test


        jest.spyOn(logger, 'logError');
        jest.spyOn(logger, 'logWarn');
        jest.spyOn(logger, 'logGood');

        process.argv = ['some/system/path', 'some/other/path', ...rawArgs];
        process.env.npm_lifecycle_event = 'clapi:route'
        args = getArgs(RouteCommandObject.validator);
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original implementations after each test
    });

    afterAll(() => {
        // rm(defaultRouteDir,{ recursive: true, force: true }, err => {
        //     if (err) {
        //         throw err;
        //     }
        // });
    });

    it('Should get directory of path', () => {
        expect(getDefaultDirectory(args, DEFAULT_DIRS.ROUTE, CONF_PROPS.ROUTE)).toBe(defaultRouteDir);
    });

    it('Should ask the user to overwrite a duplicate file or rename the current: Select to overwrite', async () => {
        args = {
            ...args,
            lang: 'js',
            includeTypes: false
        }
        const firstFilePath = 'src/routes/test.js';
        const rl = getReadlineInterface();
        GenerateRouteFile(args, rl); // create first test.js file -- this will close the readline interface
        expect(existsSync(firstFilePath)).toBe(true);

        // Attempt to create duplicate file.
        const newRl = getReadlineInterface();
        GenerateRouteFile(args, newRl);

        // @ts-ignore - ignore implementation arg requirement
        jest.spyOn(rl, 'question').mockImplementationOnce((question: string, callback: (answer: string) => void) => {
            expect(question.trim()).toBe(`${LoggerColors.FgRed}The file ${firstFilePath} already exists. Would you like to overwrite it? [Y/N] ${LoggerColors.Reset}`);
            expect(existsSync(firstFilePath)).toBe(true); // File still exists
            callback('Y'); // User inputs Y to overwrite
        });

        newRl.close();
    });

    it('Should ask the user to overwrite a duplicate file or rename the current: Select to rename', async () => {
        args = {
            ...args,
            lang: 'js',
            includeTypes: false
        }
        const firstFilePath = 'src/routes/test.js';
        const rl = getReadlineInterface();
        GenerateRouteFile(args, rl); // create first test.js file -- this will close the readline interface
        expect(existsSync(firstFilePath)).toBe(true);

        // Attempt to create duplicate file.
        const newPathDiffName = 'src/routes/newName.js'
        const newRl = getReadlineInterface();
        GenerateRouteFile(args, newRl);

        // Mock readline question method to simulate user input
        jest.spyOn(newRl, 'question')
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                callback('N'); // User inputs N to not overwrite
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe('Would you like to rename the file you are currently generating? [Y/N] ');
                callback('Y'); // User inputs Y to rename
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question.trim()).toBe('Please enter a new file name:');
                callback('newName'); // User inputs new file name
            });

        await handleDuplicateFileConflict(args, firstFilePath,  newRl);
        expect(existsSync(newPathDiffName)).toBe(true);
    });

    it('Should repeat the question for the user to input a name if the input is the same as existing name', async () => {
        args = {
            ...args,
            lang: 'js',
            includeTypes: false
        }
        const firstFilePath = 'src/routes/test.js';
        const rl = getReadlineInterface();
        GenerateRouteFile(args, rl); // create first test.js file -- this will close the readline interface
        expect(existsSync(firstFilePath)).toBe(true);

        // Attempt to create duplicate file.
        const sameName = 'newName';
        const newPathDiffName = 'src/routes/newName.js'
        const newRl = getReadlineInterface();
        GenerateRouteFile(args, newRl);

        jest.spyOn(rl, 'question')
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question.trim()).toBe(`The file ${firstFilePath} already exists. Would you like to overwrite it? [Y/N]`);
                callback('N'); // User inputs Y to rename
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question.trim()).toBe('Would you like to rename the file you are currently generating? [Y/N]');
                callback('Y'); // User inputs Y to rename
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question.trim()).toBe('Please enter a new file name:');
                callback(sameName); // User inputs the same name again
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question.trim()).toBe('Please enter a new file name:');
                callback(sameName); // User inputs the same name again
            });
    });
});
