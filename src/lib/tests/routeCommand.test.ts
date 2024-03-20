// Test coverage of this test may be a bit odd due to the way readline is tested.
// Avoided creating mocks of fs and multiple functions and focused on interacting
// with readline.Interface as the user would.
import {Command, ParsedArgs} from "../types";
import readline from "readline";
import {getArgs} from "../utils/argHandler";
import GenerateRouteFile from "../../commands/Route";
import * as logger from "../utils/logger";
import * as rc from '../../commands/Route';
import {existsSync, rm, rmdir, rmdirSync} from "fs";
import {logError, logGood} from "../utils/logger";

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
    let args: ParsedArgs;

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
        rm(defaultRouteDir,{ recursive: true, force: true }, err => {
            if (err) {
                throw err;
            }
        });
    });

    it('Should get directory of path', () => {
        expect(rc.getDirectory(args)).toBe(defaultRouteDir);
    });

    it('Should get the fileName, extension, and to include types or not for the file the user is creating', () => {
        const details = rc.getFileDetails(args);
        expect(details.fileName).toBe('test.js');
        expect(details.ext).toBe('js');
        expect(details.includeTypes).toBe(false);
    });

    it('Should return js as extension', () => {
        expect(rc.getExtension(false)).toBe('js');
    });

    it('Should return ts as extension', () => {
        expect(rc.getExtension(true)).toBe('ts');
    });

    it('Should return opposite file type of current file', () => {
        const oppositeFile = rc.getOppositeFileName(args, 'ts')
        expect(oppositeFile).toBe(`${args.name}.js`);
    });

    it('Should return a string of contents without types', () => {
       const contents = rc.getRouteFileContents(false, args.name);
       expect(typeof contents).toBe('string');
       expect(contents.includes('RouteObject')).toBe(false);
    });

    it('Should return a string of contents with types', () => {
        const contents = rc.getRouteFileContents(true, args.name);
        expect(typeof contents).toBe('string');
        expect(contents.includes('type')).toBe(true);
    });

    it('Should ask the user to overwrite a duplicate file or rename the current: Select to overwrite', async () => {
        const firstFilePath = 'src/routes/test.js';
        const rl = getReadlineInterface();
        GenerateRouteFile(args, rl); // create first test.js file -- this will close the readline interface
        expect(existsSync(firstFilePath)).toBe(true);

        // Attempt to create duplicate file.
        const newRl = getReadlineInterface();
        GenerateRouteFile(args, newRl);

        // @ts-ignore - ignore implementation arg requirement
        jest.spyOn(rl, 'question').mockImplementationOnce((question: string, callback: (answer: string) => void) => {
            expect(question).toBe(`The file ${firstFilePath} already exists. Would you like to overwrite it? [Y/N]`);
            expect(existsSync(firstFilePath)).toBe(true); // File still exists
            callback('Y'); // User inputs Y to overwrite
        });

        // Assert that logGood is called with correct message
        expect(logGood).toHaveBeenCalledWith(`${args.name} route file successfully created.`);
        expect(logError).toBeCalledWith('This file already exists overwrite or rename file you want to generate');
        newRl.close();
    });

    it('Should ask the user to overwrite a duplicate file or rename the current: Select to rename', async () => {
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
                expect(question).toBe(`The file ${firstFilePath} already exists. Would you like to overwrite it? [Y/N]`);
                callback('N'); // User inputs N to not overwrite
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe('Would you like to rename the file you are currently generating? [Y/N]');
                callback('Y'); // User inputs Y to rename
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe('Please enter a new file name: ');
                callback('newName'); // User inputs new file name
            });

        await rc.handleDuplicateFileConflict(args, firstFilePath, 'newContents', newRl);
        expect(existsSync(newPathDiffName)).toBe(true);
    });

    it('Should ask the user to overwrite a duplicate file name with different extension', async () => {
        const oldPath = 'src/routes/test.js';
        const rl = getReadlineInterface();
        GenerateRouteFile(args, rl); // create first test.js file -- this will close the readline interface
        expect(existsSync(oldPath)).toBe(true);

        // Attempt to create duplicate file.
        const newPath = 'src/routes/newName.ts'
        const newRl = getReadlineInterface();
        const newArgs = {...args, includeTypes: 'true'}; // includeTypes: 'true' to make it a ts file
        GenerateRouteFile(newArgs, newRl);

        expect(logError).toBeCalledWith('A file with the same name but different extension exists in this directory!');

        // Mock readline question method to simulate user input
        jest.spyOn(newRl, 'question')
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe(`Would you like to overwrite it? [Y/N]`);
                callback('Y'); // User inputs Y to not overwrite
            });

        const contents = rc.getRouteFileContents(true, 'newName');
        await rc.handleSameFileNameWithDifferentExtensionExists(args, newPath, oldPath, contents, newRl);
        expect(existsSync(newPath)).toBe(true);
    });

    it('Should repeat the question for the user to input a name if the input is the same as existing name', async () => {
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
                expect(question).toBe(`The file ${firstFilePath} already exists. Would you like to overwrite it? [Y/N]`);
                callback('N'); // User inputs Y to rename
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe('Would you like to rename the file you are currently generating? [Y/N]');
                callback('Y'); // User inputs Y to rename
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe('Please enter a new file name: ');
                callback(sameName); // User inputs the same name again
            })
            // @ts-ignore
            .mockImplementationOnce((question: string, callback: (answer: string) => void) => {
                expect(question).toBe('Please enter a new file name: ');
                callback(sameName); // User inputs the same name again
            });
    });
});
