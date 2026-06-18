// ***************************************************************************************************************

/**
 * Convert a file object to a base64 string or buffer.
 * @param file 
 * @returns 
 */
export async function convertFileToBase64URL(file: File): Promise<(string | ArrayBuffer | null)> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.readAsDataURL(file);

		reader.onload = () => resolve(reader.result);

		reader.onerror = error => reject(error);
	});
};