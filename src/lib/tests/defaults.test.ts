import {ParsedArgs} from "../types";
import {loadConfigAndSetArgs} from "../utils/defaults";

describe('Test exported functions in defaults.ts', () => {
    it('Should load clapi configuration file from the root directory', () => {
        const args: ParsedArgs<any> = {
            name: 'Loader',
            isBool: true,
            path: './somepath',
        }

        const parsed = loadConfigAndSetArgs(args);

        expect(typeof parsed).toBe('object');
        expect(parsed.includeTypes).toBe(true); // based on local config
        expect(parsed.lang).toBe('ts'); // based on local config
    });

    it('Should override clapi configuration with user input', () => {
        const args: ParsedArgs<any> = {
            name: 'Loader',
            isBool: true,
            path: './somepath',
            includeTypes: false,
            lang: 'js'
        }

        const parsed = loadConfigAndSetArgs(args);

        expect(typeof parsed).toBe('object');
        expect(parsed.includeTypes).toBe(false); // based on user input
        expect(parsed.lang).toBe('js'); // based on user input
    });
})
