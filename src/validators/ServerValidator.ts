import {ArgDetail, ValidatorOptions} from "../lib/types";

const includeTypes: ArgDetail = {
    name: 'includeTypes',
    description: 'Include the opinionated types for a route file.',
    treatedAs: 'boolean'
}
const generateErrorHandling: ArgDetail = {
    name: 'includeErrorHandling',
    description: 'Determines whether or not to include error handling in using the Clapi method.',
    treatedAs: 'boolean'
}

const defaultPort: ArgDetail = {
    name: 'defaultPort',
    description: 'Setting a specific path will override the default value or the value set in the ENV file for route paths.',
    treatedAs: 'number'
}

const pathDetails: ArgDetail = {
    name: 'path',
    description: 'Setting a specific path will override the default value or the value set in the ENV file for route paths.',
    treatedAs: 'string'
}

const argDetails: ArgDetail[] = [generateErrorHandling, includeTypes, pathDetails, defaultPort];

const ServerValidator: ValidatorOptions = {
    name: 'http-server',
    available: ['includeTypes',
        'includeErrorHandling',
        'defaultPort',
        'path'],
    required: ['defaultPort'],
    maxArgs: 4,
    minArgs: 1,
    argDetails,
    description: 'Generates a new http express server using a standard template. It assumes you are using the generated structure of clapi.'
};

export type ServerCommandParsedArgs = {
    path?: string
    includeErrorHandling?: boolean
    includeTypes?: boolean
    defaultPort?: number
}

export default ServerValidator;
