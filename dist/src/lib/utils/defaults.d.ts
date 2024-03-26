import { ParsedArgs } from "../types";
export declare enum DEFAULT_DIRS {
    ROUTE = "src/routes",
    SERVER = "src/servers",
    CLAPI_CONFIG = "clapi.config.json"
}
export declare enum CONF_PROPS {
    ROUTE = "routeDir",
    SERVER = "serverDir",
    CLAPI_CONFIG = "CLAPI_CONFIG_PATH"
}
export interface ClapiMeta {
    includeTypes: boolean;
    lang: 'ts' | 'js';
}
/**
 * Get directory path of file
 * @param {ParsedArgs} args
 * @param {string} defaultPath - path to use when no config value is available
 * @param {string} configProp - config property to override default value
 * @return {string}
 */
export declare function getDefaultDirectory(args: ParsedArgs<any>, defaultPath: DEFAULT_DIRS, configProp: CONF_PROPS): string;
/**
 * Load config file and set arguments
 * * If no config, rely on user input
 * @param {ParsedArgs} args
 * @return {ParsedArgs}
 */
export declare function loadConfigAndSetArgs(args: ParsedArgs<any>): ParsedArgs<ClapiMeta>;
