/**
 * Returns a date string in the following formate 'YYYY-MM-DD'.
 * @param date JS date object or date string.
 * @returns {string}
 */
export const formatDate = (date: any) => {
	return new Date(date).toISOString().replace('T', ' ').substring(0, 10);
};

export function formatMinutes(minutes: number): string {
    if (minutes > 60) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs.toString().padStart(2, '0')} hora${hrs > 1 ? "s" : ""} e ${mins.toString().padStart(2, '0')} minuto${mins > 1 ? "s" : ""}`;
    }
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
};

/**
 * This answer was borrowed. For more information check the {@link https://stackoverflow.com/a/2901298 | Stack Overflow Explanation}.
 * @param number 
 * @returns 
 */
export const formatNumber = (number: number, options?: Partial<{ currency: string, format: Intl.LocalesArgument }>) => {
	const { currency = 'AOA', format = 'pt-AO' } = (options ?? {});

	return number.toLocaleString(format, { style: 'currency', currency });
};

export const formatUUID_UC_CDN_URL = (uuid: string) => {
	return `https://ucarecdn.com/${uuid}/`;
};