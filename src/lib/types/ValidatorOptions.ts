/**
 * Represents the configuration options for a command validator.
 */
export type ValidatorOptions = {
    available: string[];
    description?: string; // description of command
    maxArgs: number; // max args this command can take
    minArgs: number; // min amount of args this command can take
    name: string;
    required: string[]; // required arguments
    argDetails: ArgDetail[]
};

export type ArgDetail = {
    name: string;
    description: string; // description of what this argument does
    treatedAs: TreatArgAs
}

// how this argument value should be treated or parsed
export type TreatArgAs = 'string' | 'boolean' | 'number' | 'array';
