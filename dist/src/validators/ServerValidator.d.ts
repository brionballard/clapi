import { ValidatorOptions } from "../lib/types";
declare const ServerValidator: ValidatorOptions;
export type ServerCommandParsedArgs = {
    path?: string;
    includeErrorHandling?: boolean;
    includeTypes?: boolean;
    defaultPort?: number;
};
export default ServerValidator;
