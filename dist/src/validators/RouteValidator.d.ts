import { type ValidatorOptions } from "../lib/types";
import { ClapiMeta } from "../lib/utils/defaults";
declare const RouteValidator: ValidatorOptions;
export interface RouteValidatorArgs extends ClapiMeta {
    name: string;
    path: string;
}
export default RouteValidator;
