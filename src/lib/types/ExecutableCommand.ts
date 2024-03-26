import {ParsedArgs} from "./ParsedArgs";
import * as readline from "readline";
import {ValidatorOptions} from "./ValidatorOptions";

export type Command = {
    name: string
    func: ExecutableCommand
    validator: ValidatorOptions
}

export type ExecutableCommand = (args: ParsedArgs<any>, rl: readline.Interface) => void
