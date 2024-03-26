import { ValidatorOptions } from "../lib/types";
import { ClapiMeta } from "../lib/utils/defaults";
declare const ServerValidator: ValidatorOptions;
export interface ServerCommandParsedArgs extends ClapiMeta {
    path?: string;
    defaultPort?: number;
}
export default ServerValidator;
