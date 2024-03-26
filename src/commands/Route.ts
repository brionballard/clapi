import path from "path";
import * as readline from "readline";
import {type ExecutableCommand, type ParsedArgs} from "../lib/types";
import {RouteTemplate, TSRouteTemplate} from "../templates/RouteTemplate";
import RouteValidator, {RouteValidatorArgs} from "../validators/RouteValidator";
import {CONF_PROPS, DEFAULT_DIRS, getDefaultDirectory} from "../lib/utils/defaults";
import {checkAndCreate, checkIfExists, createFile} from "../lib/utils/fileUtils";
import {handleDuplicateFileConflict} from "../lib/utils/clapiFlowControl";


/**
 * GenerateRouteFile - Command to generate a new route file.
 * @param {ParsedArgs<RouteValidatorArgs>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
const GenerateRouteFile: ExecutableCommand = (args: ParsedArgs<RouteValidatorArgs>, rl: readline.Interface) => {
    const dir: string = getDefaultDirectory(args, DEFAULT_DIRS.ROUTE, CONF_PROPS.ROUTE);
    const fileName: string = `${args.name}.${args.lang}`;
    const contents: string = getRouteFileContents(args.includeTypes, args.name);

    checkAndCreate(dir);

    const filePath: string = path.join(dir, fileName);

    if (checkIfExists(filePath)) {
        handleDuplicateFileConflict(args, filePath, rl).then((modifiedArgs: ParsedArgs<RouteValidatorArgs>) => {
            const newName = `${modifiedArgs.name}.${args.lang}`;
            const newPath = path.join(dir, newName);
            createFile(newPath, contents, rl);
        });
    } else {
        createFile(filePath, contents, rl);
    }
}


/**
 * Get file contents - if include types, inject types
 * @param {boolean} includeTypes
 * @param {string} name
 * @return {string}
 */
function getRouteFileContents (includeTypes: boolean, name: string): string {
    return includeTypes ? TSRouteTemplate.replace(/{name}/g, name) : RouteTemplate.replace(/{name}/g, name);
}

export const Validator = RouteValidator;
export default GenerateRouteFile;
