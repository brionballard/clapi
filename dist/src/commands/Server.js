"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const path_1 = __importDefault(require("path"));
const ServerValidator_1 = __importDefault(require("../validators/ServerValidator"));
const defaults_1 = require("../lib/utils/defaults");
const ServerTemplate_1 = require("../templates/ServerTemplate");
const clapiFlowControl_1 = require("../lib/utils/clapiFlowControl");
const fileUtils_1 = require("../lib/utils/fileUtils");
/**
 * GenerateServer - Command to generate a new http server
 * @param {ParsedArgs<ServerCommandParsedArgs>} args - Parsed arguments.
 * @param {readline.Interface} rl - Readline interface for user input.
 */
const GenerateServer = (args, rl) => {
    const dir = (0, defaults_1.getDefaultDirectory)(args, defaults_1.DEFAULT_DIRS.SERVER, defaults_1.CONF_PROPS.SERVER);
    const fileName = `${args.name ?? 'server'}.${args.lang}`;
    const contents = getServerFileContents(args);
    (0, fileUtils_1.checkAndCreate)(dir);
    const filePath = path_1.default.join(dir, fileName);
    if ((0, fileUtils_1.checkIfExists)(filePath)) {
        (0, clapiFlowControl_1.handleDuplicateFileConflict)(args, filePath, rl).then((modifiedArgs) => {
            (0, fileUtils_1.createFile)(filePath, contents, rl);
        });
    }
    else {
        (0, fileUtils_1.createFile)(filePath, contents, rl);
    }
};
/**
 * Get file contents - if include types, inject types
 * @param {ParsedArgs<ServerCommandParsedArgs>} args
 * @return {number}
 */
function getServerFileContents(args) {
    const base = args.includeTypes ? ServerTemplate_1.TSServerTemplate.replace(/{defaultPort}/g, args.defaultPort.toString()) : ServerTemplate_1.ServerTemplate.replace(/{defaultPort}/g, args.defaultPort.toString());
    return base.replace(/{name}/g, args.name ?? 'server');
}
exports.Validator = ServerValidator_1.default;
exports.default = GenerateServer;
