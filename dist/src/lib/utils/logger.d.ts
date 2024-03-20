export declare enum LoggerColors {
    Reset = "\u001B[0m",
    Bright = "\u001B[1m",
    Dim = "\u001B[2m",
    Underscore = "\u001B[4m",
    Blink = "\u001B[5m",
    Reverse = "\u001B[7m",
    Hidden = "\u001B[8m",
    FgBlack = "\u001B[30m",
    FgRed = "\u001B[31m",
    FgGreen = "\u001B[32m",
    FgYellow = "\u001B[33m",
    FgBlue = "\u001B[34m",
    FgMagenta = "\u001B[35m",
    FgCyan = "\u001B[36m",
    FgWhite = "\u001B[37m",
    FgGray = "\u001B[90m",
    BgBlack = "\u001B[40m",
    BgRed = "\u001B[41m",
    BgGreen = "\u001B[42m",
    BgYellow = "\u001B[43m",
    BgBlue = "\u001B[44m",
    BgMagenta = "\u001B[45m",
    BgCyan = "\u001B[46m",
    BgWhite = "\u001B[47m",
    BgGray = "\u001B[100m"
}
declare const ErrorMsgs: {
    InvalidKeyword: () => string;
    MaxArgumentExceeded: (commandName: string, expected: string | number) => string;
    MinArgumentExceeded: (commandName: string, expected: string | number) => string;
    InvalidModifierName: (provided: string, expected: string | number) => string;
    IllegalCommandArguments: (provided: string[], expected: string[]) => string;
    MissingRequiredArguments: (received: string[], required: string[], missing: string[]) => string;
    InvalidCommandPathError: (path: string) => string;
    InvalidValidatorsPathError: (path: string) => string;
};
declare function logError(msg: string): void;
declare function logWarn(msg: string): void;
declare function logGood(msg: string): void;
declare function logCustom(color: string, msg: string): void;
export { logError, logWarn, logGood, logCustom, ErrorMsgs };
