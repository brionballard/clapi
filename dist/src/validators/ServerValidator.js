"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nameType = {
    name: 'name',
    description: 'This will be used as the export function name and file name. Defaults to "server"',
    treatedAs: 'string'
};
const defaultPort = {
    name: 'defaultPort',
    description: 'Setting a specific path will override the default value or the value set in the ENV file for route paths.',
    treatedAs: 'number'
};
const includeTypes = {
    name: 'includeTypes',
    description: 'Include the opinionated types for a route file.',
    treatedAs: 'boolean'
};
const pathDetails = {
    name: 'path',
    description: 'Setting a specific path will override the default value or the value set in the ENV file for route paths.',
    treatedAs: 'string'
};
const argDetails = [defaultPort, nameType, pathDetails, includeTypes];
const ServerValidator = {
    name: 'Create HTTP Server',
    available: ['defaultPort', 'name', 'path', 'includeTypes'],
    required: ['defaultPort'],
    maxArgs: 4,
    minArgs: 1,
    argDetails,
    description: 'Generates a new http express server using a standard template. It assumes you are using the generated structure of clapi.'
};
exports.default = ServerValidator;
