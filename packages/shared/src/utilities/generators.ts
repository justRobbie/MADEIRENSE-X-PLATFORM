import { ALLOWED_SPECIAL_CHARACTERS } from "./constants.js";
import { convertFileToBase64URL } from "./converters.js";

// ***************************************************************************************************************

const DEFAULT_GENERATOR_STRING_LENGTH = 16;

/**
 * Generates a random number string according length. Default is 16.
 */
export function generateRandomNumbers(length = DEFAULT_GENERATOR_STRING_LENGTH) {
    if (length <= 0) return 0;
    
    const randomNumbers = [];
    
    for (let i = 0; i < length; i++) {
        randomNumbers.push(Math.floor(Math.random() * 10).toString());
    }

    return parseInt(randomNumbers.join(''));
};

type RandomStringGeneratorOptionsType = { 
    excludeSpecialChars?: boolean 
};

const DEFAULT_GENERATE_RANDOM_STRING_OPTIONS: Partial<RandomStringGeneratorOptionsType> = { 
    excludeSpecialChars: false 
};

/**
 * Generates a password-friendly random string according length. Default is 16.
 */
export function generateRandomString(length = DEFAULT_GENERATOR_STRING_LENGTH, options: Readonly<RandomStringGeneratorOptionsType> = DEFAULT_GENERATE_RANDOM_STRING_OPTIONS) {
    if (length <= 0) return '';
    
    const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789${options.excludeSpecialChars ? "" : ALLOWED_SPECIAL_CHARACTERS}`;

    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIdx = Math.floor(Math.random() * chars.length);
        result += chars[randomIdx];
    }
    
    return result;
};

/**
 * Generates a string with random RGB numbers placement: rgb(R, G, B).
 */
export function generateRGBColor() {
    const randomByte = () => Math.floor(Math.random() * 256);

    return `rgb(${Array.from(Array(3), i => randomByte()).join(', ')})`;
};

type generatedFileObjectType = Partial<File> & { mimeType: string, base64Content: string, fileName: string, value?: string | number };

/**
 * Generate the default file object structure used in ATL Front-Único projects.
 * @param name 
 * @param file 
 * @returns 
 */
export async function generateFileObject(name: string, file: File, compressSize: boolean = true): Promise<generatedFileObjectType> {
	let possiblyCompressedFile = file;

	try {
		const mimeType = possiblyCompressedFile.name.slice((possiblyCompressedFile.name.lastIndexOf('.') + 1), possiblyCompressedFile.name.length).toLowerCase();

		const newFile = new File([possiblyCompressedFile], name, { type: possiblyCompressedFile.type });

		const base64Content = await convertFileToBase64URL(newFile) as string;

		return {
			fileName: name,
			name: newFile.name,
			size: newFile.size,
			type: newFile.type,
			webkitRelativePath: newFile.webkitRelativePath,
			mimeType,
			base64Content
		};
	} catch (error) {
		throw new Error((error as Error).message);
	}
};