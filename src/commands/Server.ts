import { config } from "dotenv";
config();

import { type ExecutableCommand, type ParsedArgs, type ValidatorOptions} from "../lib/types";
import readline from "readline";
import ServerValidator, {ServerCommandParsedArgs} from "../validators/ServerValidator";
import {logGood} from "../lib/utils/logger";

const GenerateServer: ExecutableCommand = (args: ServerCommandParsedArgs, rl: readline.Interface) => {
    console.log(args)
}

export default GenerateServer;
const Validator: ValidatorOptions = ServerValidator;

export {
    Validator
}
