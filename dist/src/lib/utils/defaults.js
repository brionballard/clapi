"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigAndSetArgs = exports.getDefaultDirectory = exports.CONF_PROPS = exports.DEFAULT_DIRS = void 0;
const fs_1 = require("fs");
// Default directory values independent of config
var DEFAULT_DIRS;
(function (DEFAULT_DIRS) {
    DEFAULT_DIRS["ROUTE"] = "src/routes";
    DEFAULT_DIRS["SERVER"] = "src/servers";
    DEFAULT_DIRS["CLAPI_CONFIG"] = "clapi.config.json";
})(DEFAULT_DIRS || (exports.DEFAULT_DIRS = DEFAULT_DIRS = {}));
// config properties to look up in config file
var CONF_PROPS;
(function (CONF_PROPS) {
    CONF_PROPS["ROUTE"] = "routeDir";
    CONF_PROPS["SERVER"] = "serverDir";
    CONF_PROPS["CLAPI_CONFIG"] = "CLAPI_CONFIG_PATH";
})(CONF_PROPS || (exports.CONF_PROPS = CONF_PROPS = {}));
/**
 * Get directory path of file
 * @param {ParsedArgs} args
 * @param {string} defaultPath - path to use when no config value is available
 * @param {string} configProp - config property to override default value
 * @return {string}
 */
function getDefaultDirectory(args, defaultPath, configProp) {
    const config = loadConfigAndSetArgs(args);
    const defaultDir = config[configProp] ?? defaultPath; // config value may be undefined, use defaultPath
    // if default path doesn't exist, throw an error
    if (!defaultDir) {
        throw new Error('Could not find default directory path.');
    }
    // if args does not contain path property, use defaultDir
    if (!args.hasOwnProperty('path')) {
        return defaultDir;
    }
    return args.path; // use user input to override all other values
}
exports.getDefaultDirectory = getDefaultDirectory;
/**
 * Load config file and set arguments
 * * If no config, rely on user input
 * @param {ParsedArgs} args
 * @return {ParsedArgs}
 */
function loadConfigAndSetArgs(args) {
    if ((0, fs_1.existsSync)(DEFAULT_DIRS.CLAPI_CONFIG)) {
        const config = loadConfig();
        if (!config.hasOwnProperty('lang')) {
            throw new Error('Cannot process commands without lang property in config.');
        }
        args = setIncludeTypes(args, config);
        args.lang = args.lang ?? config.lang;
    }
    return args;
}
exports.loadConfigAndSetArgs = loadConfigAndSetArgs;
/**
 * Set include types property from config
 * * User input overrides the config setting
 * @param {ParsedArgs} args
 * @param {ClapiConf} config
 * @return {ParsedArgs}
 */
function setIncludeTypes(args, config) {
    if (config.hasOwnProperty('includeTypes')) {
        args.includeTypes = args.includeTypes ?? config.includeTypes;
    }
    else {
        args.includeTypes = false;
    }
    return args;
}
function loadConfig() {
    const content = (0, fs_1.readFileSync)(DEFAULT_DIRS.CLAPI_CONFIG, 'utf-8');
    return JSON.parse(content);
}
