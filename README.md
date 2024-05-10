# Clapi

Clapi is a cli app to build the boiler plate code for my standard applications be it whole applications or individual pieces such as servers, routes, or other single components.

Clapi has an opinionated file system that allows for smooth user input and fast automation. There are sets of commands that configured in the terminal by the user. When a user completes their configuration, the code executes and it generates the boiler plate code for whatever component they selected.

# Instructions

Clapi should be installed as a dev dependency in your project and only used to scaffold components of your project such as starting a new microservice or just creating a single file.

`npm i clapi-bb --save-dev`

`clapi`

## Available Commands

- Route
    - Generate a route file
    - Arguments: name, path, includeTypes
    - 
## Under the hood

### Commands

Commands are the generation logic/files and are comprised of two things:

- Execution file including a default export
    - Command files should be created as `src/commads/{Command}.ts`
        - Command files should use the command name as the file name
        - Command files must have a default export that executes the logic of the command
            - The default export must adhere to the `ExecutableCommand` type.
- A Validator

### Validators
- There are two options when creating a validator, you may create your own validator file in the validators directory or export it from the command file itself. We recommend creating your own Validator so it can be individually searched if needed.
  - Validators should be created as `src/validators/{Command}Validator.ts`
  - All validators must adhere to the `ValidatorOptions`  type
  - Validators can include some descriptive information by using the `argDetails` property that adheres to the `ArgDetail` type
  - As an alternative, you may export a `Validator` as the default from your Command file that adheres to the types mentioned above. View the code example below
  `const {CommandName}Validator = {
  // validation rules
  }

  export default {CommandName}Validator`;
    - If you do not create a `Validator` with your command, it will not be loaded into the command selections presented to the user.

## Clapi

When you initialize Clapi with the command `clapi` the code follows this structure:

1. Load all of the commands from the command directory
    1. Load all of the validators and assign them to their respectively named Commands
2. Present the commands to the user
3. User selects a command
4. Present available and required command arguments to the user
5. Assemble them and set them as `process.argv` items
6. Validate and parse arguments with `src/lib/utils/argHandler.ts`
7. Execute the command

All of the requirements should be controlled by the Validator, presented by Clapi, and executed by the Command
