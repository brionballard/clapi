/**
 * Represents the configuration options for a command validator.
 */
export type ValidatorOptions = {
    available: string[];
    description?: string;
    maxArgs: number;
    minArgs: number;
    name: string;
    required: string[];
    argDetails: ArgDetail[];
};
export type ArgDetail = {
    name: string;
    description: string;
    treatedAs: TreatArgAs;
};
export type TreatArgAs = 'string' | 'boolean' | 'number' | 'array';
