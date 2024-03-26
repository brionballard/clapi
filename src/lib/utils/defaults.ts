import {ParsedArgs} from "../types";
import {existsSync, readFileSync} from "fs";

// Default directory values independent of config
export enum DEFAULT_DIRS {
    ROUTE = 'src/routes',
    SERVER = 'src/servers',
    CLAPI_CONFIG = 'clapi.config.json'
}

// config properties to look up in config file
export enum CONF_PROPS {
    ROUTE = 'routeDir',
    SERVER = 'serverDir',
    CLAPI_CONFIG = 'CLAPI_CONFIG_PATH'
}

type ClapiConf = {
    lang: 'ts' | 'js';
    includeTypes?: boolean;
    routeDir?: string;
    serverDir?: string;
}

// properties that will be dynamically injected into the args if the config is present
export interface ClapiMeta {
    includeTypes: boolean;
    lang: 'ts' | 'js'
}

/**
 * Get directory path of file
 * @param {ParsedArgs} args
 * @param {string} defaultPath - path to use when no config value is available
 * @param {string} configProp - config property to override default value
 * @return {string}
 */
export function getDefaultDirectory (args: ParsedArgs<any>, defaultPath: DEFAULT_DIRS, configProp: CONF_PROPS): string {
    const config: ParsedArgs<ClapiMeta> = loadConfigAndSetArgs(args)
    const defaultDir: string | undefined = config[configProp] ?? defaultPath; // config value may be undefined, use defaultPath

    // if default path doesn't exist, throw an error
    if (!defaultDir) {
        throw new Error('Could not find default directory path.');
    }

    // if args does not contain path property, use defaultDir
    if (!args.hasOwnProperty('path')) {
        return defaultDir ;
    }

    return args.path; // use user input to override all other values
}

/**
 * Load config file and set arguments
 * * If no config, rely on user input
 * @param {ParsedArgs} args
 * @return {ParsedArgs}
 */
export function loadConfigAndSetArgs (args: ParsedArgs<any>): ParsedArgs<ClapiMeta> {
    if (existsSync(DEFAULT_DIRS.CLAPI_CONFIG)) {
        const config: Record<string, any> = loadConfig();

        if (!config.hasOwnProperty('lang')) {
            throw new Error('Cannot process commands without lang property in config.')
        }

        args = setIncludeTypes(args, config);
        args.lang = args.lang ?? config.lang;
    }

    return args;
}

/**
 * Set include types property from config
 * * User input overrides the config setting
 * @param {ParsedArgs} args
 * @param {ClapiConf} config
 * @return {ParsedArgs}
 */
function setIncludeTypes (args: ParsedArgs<any>, config: Record<string, any>): ParsedArgs<ClapiMeta> {
    if (config.hasOwnProperty('includeTypes')) {
        args.includeTypes =  args.includeTypes ?? config.includeTypes;
    } else {
        args.includeTypes = false;
    }

    return args;
}

function loadConfig (): Record<string, any> {
    const content: string = readFileSync(DEFAULT_DIRS.CLAPI_CONFIG, 'utf-8');
    return JSON.parse(content);
}
