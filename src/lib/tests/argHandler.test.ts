import {
   parseArgsArrayToObject,
   validateArguments,
   getArgs,
   checkForRequiredArguments,
   checkForIllegalArguments,
   checkProvidedCommandModifierName,
   checkMinArguments,
   checkMaxArguments
} from "../utils/argHandler";

import * as logger from '../utils/logger';
import {ErrorMsgs, logError} from "../utils/logger";
import {ValidatorOptions} from "../types";

const validationOptions: ValidatorOptions = {
   maxArgs: 3,
   minArgs: 2,
   name: 'route',
   available: ['name', 'type', 'action'],
   required: ['name', 'type'],
   argDetails: [
      {
         name: 'name',
         treatedAs: 'string',
         description: ""
      },
      {
         name: 'type',
         treatedAs: 'string',
         description: ""
      },
      {
         name: 'action',
         treatedAs: 'string',
         description: ""
      }
   ]
}

/**
 * Arbitrary arguments that are independent of any command
 */
const args = [
    'name=animal',
    'type=fish',
    'action=swim'
];

describe('Test command argument parsing and validation', () => {
   beforeEach(() => {
      // Mock the environment
      jest.spyOn(process, 'exit').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test
      jest.spyOn(console, 'error').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test
      jest.spyOn(console, 'warn').mockImplementation(() => {}); // disables jest from logging any of the messages logged in this test


      jest.spyOn(logger, 'logError');
      jest.spyOn(logger, 'logWarn');
      jest.spyOn(logger, 'logGood');

      process.env.npm_lifecycle_event = 'clapi:route'
      process.argv = ['some/system/path', 'some/other/path', ...args];
   });

   afterEach(() => {
      jest.restoreAllMocks(); // Restore original implementations after each test
   });

   it('Should return validated & parsed args', () => {
      const parsed = getArgs(validationOptions);

      expect(typeof parsed).toBe('object');

      expect(parsed).toHaveProperty('name');
      expect(parsed.name).toBe('animal');

      expect(parsed).toHaveProperty('type');
      expect(parsed.type).toBe('fish');

      expect(parsed).toHaveProperty('action');
      expect(parsed.action).toBe('swim');
   });

   it('Should pass all validation rules', () => {
      const parsed = parseArgsArrayToObject(args, validationOptions);
      validateArguments(parsed, validationOptions);
   });

   it('Should test incorrect keyword - clapi:', () => {
      process.env.npm_lifecycle_event = 'clap:route' // invalid in comparison to validation options
      getArgs(validationOptions)

      expect(logError).toHaveBeenCalledWith(ErrorMsgs.InvalidKeyword());
      expect(process.exit).toHaveBeenCalledWith(1);
   });

   it('Should test invalid command modifier name - :{modifier}', () => {
      process.env.npm_lifecycle_event = 'clapi:roue' // invalid in comparison to validation options

      checkProvidedCommandModifierName(validationOptions.name);

      expect(logError).toHaveBeenCalledWith(ErrorMsgs.InvalidModifierName('roue', 'route'));
      expect(process.exit).toHaveBeenCalledWith(1);
   });

   it('Should test to many arguments', () => {
      const argsMax = [...args, 'max=plus']
      const parsed = parseArgsArrayToObject(argsMax, validationOptions);

      checkMaxArguments(Object.keys(parsed).length, validationOptions.maxArgs, validationOptions.name);

      expect(logError).toHaveBeenCalledWith(ErrorMsgs.MaxArgumentExceeded(validationOptions.name, validationOptions.maxArgs));
      expect(process.exit).toHaveBeenCalledWith(1);
   });

   it('Should test to few arguments', () => {
      const parsed = {...parseArgsArrayToObject(args, validationOptions)};
      const argLen = Object.keys(parsed).slice(2).length
      checkMinArguments(argLen, validationOptions.minArgs, validationOptions.name);

      expect(logError).toHaveBeenCalledWith(ErrorMsgs.MinArgumentExceeded(validationOptions.name, validationOptions.minArgs));
      expect(process.exit).toHaveBeenCalledWith(1);
   });

   it('Should test illegal arguments', () => {
      const parsed = {...parseArgsArrayToObject(args, validationOptions)};
      parsed.newKey = parsed.name; // swap value of name to newKey
      delete parsed.name; // remove old valid property

      const provided = Object.keys(parsed);
      const expected = validationOptions.available;

      checkForIllegalArguments(provided, expected);

      expect(logError).toHaveBeenCalledWith(ErrorMsgs.IllegalCommandArguments(provided, expected));
      expect(process.exit).toHaveBeenCalledWith(1);
   });

   it('Should test missing arguments', () => {
      const parsed = {...parseArgsArrayToObject(args, validationOptions)};
      delete parsed.name; // remove a required argument

      const received = Object.keys(parsed);
      const required = validationOptions.required;
      const missing: string[] = [];

      required.map((req: string) => {
         if (!received.includes(req)) {
            missing.push(req)
         }
      });

      checkForRequiredArguments(Object.keys(parsed), validationOptions.required);

      expect(logError).toHaveBeenCalledWith(ErrorMsgs.MissingRequiredArguments(received, required, missing));
      expect(process.exit).toHaveBeenCalledWith(1);
   });
});

