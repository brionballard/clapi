#! /usr/bin/env node
import path from "path";
import * as readline from "readline";
import {Command} from "./lib/types";
import {
    askUserToSelectCommand,
    formatAndDisplayCommandSelections,
    loadCommands,
} from "./lib/utils/clapiFlowControl";

const rl: readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const commandsDirPath: string = path.join(__dirname, 'commands');

console.clear();
function init () {
    const commands: Command[] = loadCommands(commandsDirPath);
    formatAndDisplayCommandSelections(commands)
    askUserToSelectCommand(commands, rl);
}

init();
