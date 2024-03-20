export enum LoggerColors {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    // Fonts
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    FgGray = "\x1b[90m",

    // Background
    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m",
    BgGray = "\x1b[100m",
}

const ErrorMsgs = {
    InvalidKeyword: () => 'InvalidCommand: Missing keyword \'clapi:\'',
    MaxArgumentExceeded: (commandName: string, expected: string | number) => `MaxArgumentExceeded: Max args for the ${commandName} command is ${expected}`,
    MinArgumentExceeded: (commandName: string, expected: string | number) => `MinArgumentsRequired: Min args for the ${commandName} command is ${expected}`,
    InvalidModifierName: (provided: string, expected: string | number) => `InvalidModifierName: Ensure the command modifier is correct. Received: '${provided}'. Expected '${expected}'.`,
    IllegalCommandArguments: (provided: string[], expected: string[]) => `IllegalCommandArguments: Received ${provided.join(', ')}. Expected ${expected.join(', ')}.`,
    MissingRequiredArguments: (received: string[], required: string[], missing: string[]) => `MissingRequiredArguments: Received ${received.join(', ')}. Expected ${required.join(', ')}. You are missing ${missing.join(', ')}`,
    InvalidCommandPathError: (path: string) => `CommandsPathError: Commands path ${path} does not exists.`,
    InvalidValidatorsPathError: (path: string) => `InvalidValidatorsPathError: Validators path ${path} does not exists.`
}

function logError(msg: string): void {
    console.error(LoggerColors.FgRed, `${msg}`, LoggerColors.Reset);
}

function logWarn(msg: string): void {
    console.warn(LoggerColors.FgYellow, `${msg}`, LoggerColors.Reset);
}

function logGood(msg: string): void {
    console.log(LoggerColors.FgGreen, `${msg}`, LoggerColors.Reset);
}

function logCustom(color: string, msg: string): void {
    console.log(color, `${msg}`, LoggerColors.Reset);
}


export {
    logError,
    logWarn,
    logGood,
    logCustom,
    ErrorMsgs
}
