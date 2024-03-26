"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const path_1 = __importDefault(require("path"));
const RouteTemplate_1 = require("../templates/RouteTemplate");
const RouteValidator_1 = __importDefault(require("../validators/RouteValidator"));
const defaults_1 = require("../lib/utils/defaults");
const fileUtils_1 = require("../lib/utils/fileUtils");
const clapiFlowControl_1 = require("../lib/utils/clapiFlowControl");
/**
 * GenerateRouteFile - Command to generate a new route file.
 * @param {ParsedArgs<RouteValidatorArgs>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
const GenerateRouteFile = (args, rl) => {
    const dir = (0, defaults_1.getDefaultDirectory)(args, defaults_1.DEFAULT_DIRS.ROUTE, defaults_1.CONF_PROPS.ROUTE);
    const fileName = `${args.name}.${args.lang}`;
    const contents = getRouteFileContents(args.includeTypes, args.name);
    (0, fileUtils_1.checkAndCreate)(dir);
    const filePath = path_1.default.join(dir, fileName);
    if ((0, fileUtils_1.checkIfExists)(filePath)) {
        (0, clapiFlowControl_1.handleDuplicateFileConflict)(args, filePath, rl).then((modifiedArgs) => {
            const newName = `${modifiedArgs.name}.${args.lang}`;
            const newPath = path_1.default.join(dir, newName);
            (0, fileUtils_1.createFile)(newPath, contents, rl);
        });
    }
    else {
        (0, fileUtils_1.createFile)(filePath, contents, rl);
    }
};
/**
 * Get file contents - if include types, inject types
 * @param {boolean} includeTypes
 * @param {string} name
 * @return {string}
 */
function getRouteFileContents(includeTypes, name) {
    return includeTypes ? RouteTemplate_1.TSRouteTemplate.replace(/{name}/g, name) : RouteTemplate_1.RouteTemplate.replace(/{name}/g, name);
}
exports.Validator = RouteValidator_1.default;
exports.default = GenerateRouteFile;
