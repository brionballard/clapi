import path from "path";
import readline from "readline";
import {type ExecutableCommand, type ParsedArgs, type ValidatorOptions} from "../lib/types";
import ServerValidator, { ServerCommandParsedArgs } from "../validators/ServerValidator";
import {DEFAULT_DIRS, CONF_PROPS, getDefaultDirectory} from "../lib/utils/defaults";
import {ServerTemplate, TSServerTemplate} from "../templates/ServerTemplate";
import {handleDuplicateFileConflict} from "../lib/utils/clapiFlowControl";
import {checkAndCreate, checkIfExists, createFile} from "../lib/utils/fileUtils";

/**
 * GenerateServer - Command to generate a new http server
 * @param {ParsedArgs<ServerCommandParsedArgs>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
const GenerateServer: ExecutableCommand = (args: ParsedArgs<ServerCommandParsedArgs>, rl: readline.Interface) => {
    const dir: string = getDefaultDirectory(args, DEFAULT_DIRS.SERVER, CONF_PROPS.SERVER);
    const fileName: string = `${args.name ?? 'server'}.${args.lang}`
    const contents: string = getServerFileContents(args);

    checkAndCreate(dir);

    const filePath: string = path.join(dir, fileName);

    if (checkIfExists(filePath)) {
        handleDuplicateFileConflict(args, filePath, rl).then((modifiedArgs: ParsedArgs<ServerCommandParsedArgs>) => {
            createFile(filePath, contents, rl);
        });
    }else {
        createFile(filePath, contents, rl);
    }
}

/**
 * Get file contents - if include types, inject types
 * @param {ParsedArgs<ServerCommandParsedArgs>} args
 * @return {number}
 */
function getServerFileContents (args: ParsedArgs<ServerCommandParsedArgs>): string {
    const base = args.includeTypes ? TSServerTemplate.replace(/{defaultPort}/g, args.defaultPort.toString()) : ServerTemplate.replace(/{defaultPort}/g, args.defaultPort.toString());
    return base.replace(/{name}/g, args.name ?? 'server');
}

export const Validator: ValidatorOptions = ServerValidator;
export default GenerateServer;
