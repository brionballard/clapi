/**
 * Represents the configuration options for a command validator.
 */
export type ValidatorOptions = {
    available: string[];
    description?: string; // description of command
    maxArgs: number;
    minArgs: number;
    name: string;
    required: string[];
    argDetails?: ArgDetail[]
};

export type ArgDetail = {
    name: string;
    description: string;
    treatedAs: 'string' | 'boolean' | 'number' | 'array'
}
