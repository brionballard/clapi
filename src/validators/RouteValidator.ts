import {type ValidatorOptions, type ArgDetail} from "../lib/types";

const description: string = 'The route command generates the boiler plate code for a API routes file. It will include the methods: GET(one), GET(many), POST, PUT, DELETE.'
const nameType: ArgDetail = {
    name: 'name',
    description: 'This will be used as the export function name and file name.',
    treatedAs: 'string'
}

const pathDetails: ArgDetail = {
    name: 'path',
    description: 'Setting a specific path will override the default value or the value set in the ENV file for route paths.',
    treatedAs: 'string'
}

const includeTypes: ArgDetail = {
    name: 'includeTypes',
    description: 'Include the opinionated types for a route file.',
    treatedAs: 'boolean'
}

const argDetails: ArgDetail[] = [nameType, includeTypes, pathDetails];

const RouteValidator: ValidatorOptions = {
    maxArgs: 3,
    minArgs: 1,
    name: 'route',
    available: ['name', 'path', 'includeTypes'],
    required: ['name'],
    argDetails,
    description,
}

export default RouteValidator;
