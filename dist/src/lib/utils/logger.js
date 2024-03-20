"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMsgs = exports.logCustom = exports.logGood = exports.logWarn = exports.logError = exports.LoggerColors = void 0;
var LoggerColors;
(function (LoggerColors) {
    LoggerColors["Reset"] = "\u001B[0m";
    LoggerColors["Bright"] = "\u001B[1m";
    LoggerColors["Dim"] = "\u001B[2m";
    LoggerColors["Underscore"] = "\u001B[4m";
    LoggerColors["Blink"] = "\u001B[5m";
    LoggerColors["Reverse"] = "\u001B[7m";
    LoggerColors["Hidden"] = "\u001B[8m";
    // Fonts
    LoggerColors["FgBlack"] = "\u001B[30m";
    LoggerColors["FgRed"] = "\u001B[31m";
    LoggerColors["FgGreen"] = "\u001B[32m";
    LoggerColors["FgYellow"] = "\u001B[33m";
    LoggerColors["FgBlue"] = "\u001B[34m";
    LoggerColors["FgMagenta"] = "\u001B[35m";
    LoggerColors["FgCyan"] = "\u001B[36m";
    LoggerColors["FgWhite"] = "\u001B[37m";
    LoggerColors["FgGray"] = "\u001B[90m";
    // Background
    LoggerColors["BgBlack"] = "\u001B[40m";
    LoggerColors["BgRed"] = "\u001B[41m";
    LoggerColors["BgGreen"] = "\u001B[42m";
    LoggerColors["BgYellow"] = "\u001B[43m";
    LoggerColors["BgBlue"] = "\u001B[44m";
    LoggerColors["BgMagenta"] = "\u001B[45m";
    LoggerColors["BgCyan"] = "\u001B[46m";
    LoggerColors["BgWhite"] = "\u001B[47m";
    LoggerColors["BgGray"] = "\u001B[100m";
})(LoggerColors || (exports.LoggerColors = LoggerColors = {}));
const ErrorMsgs = {
    InvalidKeyword: () => 'InvalidCommand: Missing keyword \'clapi:\'',
    MaxArgumentExceeded: (commandName, expected) => `MaxArgumentExceeded: Max args for the ${commandName} command is ${expected}`,
    MinArgumentExceeded: (commandName, expected) => `MinArgumentsRequired: Min args for the ${commandName} command is ${expected}`,
    InvalidModifierName: (provided, expected) => `InvalidModifierName: Ensure the command modifier is correct. Received: '${provided}'. Expected '${expected}'.`,
    IllegalCommandArguments: (provided, expected) => `IllegalCommandArguments: Received ${provided.join(', ')}. Expected ${expected.join(', ')}.`,
    MissingRequiredArguments: (received, required, missing) => `MissingRequiredArguments: Received ${received.join(', ')}. Expected ${required.join(', ')}. You are missing ${missing.join(', ')}`,
    InvalidCommandPathError: (path) => `CommandsPathError: Commands path ${path} does not exists.`,
    InvalidValidatorsPathError: (path) => `InvalidValidatorsPathError: Validators path ${path} does not exists.`
};
exports.ErrorMsgs = ErrorMsgs;
function logError(msg) {
    console.error(LoggerColors.FgRed, `${msg}`, LoggerColors.Reset);
}
exports.logError = logError;
function logWarn(msg) {
    console.warn(LoggerColors.FgYellow, `${msg}`, LoggerColors.Reset);
}
exports.logWarn = logWarn;
function logGood(msg) {
    console.log(LoggerColors.FgGreen, `${msg}`, LoggerColors.Reset);
}
exports.logGood = logGood;
function logCustom(color, msg) {
    console.log(color, `${msg}`, LoggerColors.Reset);
}
exports.logCustom = logCustom;
