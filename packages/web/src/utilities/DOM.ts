import {
	DEFAULT_DEBOUNCE_MS,
	isInvalidValue
} from "@Madeirense/shared";

import type { 
	KeyboardEvent
} from "react";

// ***************************************************************************************************************

/**
 * Copies the argument string to the clipboard.
 * @param {string} str 
 */
export const copyToClipboard = (str: string): void => {
	// Got this code from: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
	//
	const el = document.createElement('textarea'); // Create a <textarea> element

	el.value = str; // Set its value to the string that you want copied
	el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
	el.style.position = 'absolute';
	el.style.left = '-9999px'; // Move outside the screen to make it invisible

	document.body.appendChild(el); // Append the <textarea> element to the HTML document

	el.select(); // Select the <textarea> content
	el.setSelectionRange(0, 99999);

	if (window.isSecureContext && (navigator.clipboard !== undefined))
		navigator.clipboard.writeText(el.value);
	else try {
		document.execCommand('copy');
	} catch (error) {
		console.error(`In :: 'copyToClipboard' :: Unable to perform copy command`, error);
	}

	document.body.removeChild(el);
};

/**
 * Takes a function and calls it after a certain amount of time. 
 * @param {function} fn
 * @param {number} delayMS The amount of time (in milliseconds) scheduled for the function to fire. {@link DEFAULT_DEBOUNCE_MS | 500ms by default.}
 * @returns {function}
 * 
 * ---
 * 
 * @see {@link https://www.techtarget.com/whatis/definition/debouncing | Use case logic behind `debouncing`.}
 */
export function debounceKeyboardEvent<E>(fn: Function, delayMS: number = DEFAULT_DEBOUNCE_MS): (e: KeyboardEvent<E>) => void {
	let timer: NodeJS.Timeout;

	return (e: KeyboardEvent<E>) => {
		clearTimeout(timer);

		if (e.key.toLowerCase() === "enter") return;

		timer = setTimeout(() => fn(e), delayMS);
	};
};

/**
 * Downloads the base64 document on the current tab.
 * @param {string} base64 Base64 string of the document
 * @param {string} name Name of the file
 * @param {string} mimeType File extension
 */
export const downloadDocument = (base64: string, name: string, mimeType: string): void => {
	let link = document.createElement('a');

	link.href = base64;

	link.download = `${name}.${mimeType}`;

	link.click();
};

/**
 * Returns true when the keycode corresponds to the desired type it was chosen. By default, it allows [shift, enter, home, end, tab, space, backspace] keys. Used for preventing specific keys to register or fire events when typed into an input element.
 * @param {string} type The type of keycode to be filtered.
 * @param {number} keyCode The corresponding keyboard keycode.
 * @returns {boolean}
 */
export function filterKeyboardKeys(type: string, keyCode: number): boolean {
	switch (type) {
		case 'NUMBERS': return [8, 13, 16, 35, 36, 37, 38, 39, 40, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 69, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 190].includes(keyCode);

		default: return false;
	};
};

/**
 * Only fires the callback function after the enter key is pressed.
 * @param {Object} e Event DOM object.
 * @param {number} e.key The corresponding keyboard key.
 * @param {function} callback The function to fire after the Enter Key is pressed.
 */
export function fireEventOnEnter(callback: Function) {
	return (e: any) => {
		if (e.key === 'Enter') callback(e);
	};
};

/**
 * Opens provided link on a new tab by default.
 * @param href 
 * @param newTab This value is true by default, set it to "false" if you choose to substitute the current tab.
 */
export const openLink = (href: string, newTab = true): void => {
	if (['', '#'].includes(href) || isInvalidValue(href) || typeof (href) !== 'string') return;

	const $temp_anchor_ELEMENT = document.createElement('a');

	$temp_anchor_ELEMENT.href = href;

	$temp_anchor_ELEMENT.target = (newTab) ? '_blank' : '';

	$temp_anchor_ELEMENT.rel = (newTab) ? 'noopener noreferrer' : '';

	$temp_anchor_ELEMENT.click();

	setTimeout(() => { $temp_anchor_ELEMENT.remove(); }, 100);
};

/**
 * Scrolls to the top position of the target element.
 * @param id Element contained within the current HTML Document.
 */
export const scrollToElement = (id: string): void => {
	let element = document.getElementById(id);

	if (!element) return;

	let topElementPosition = 0;

	if (element.offsetParent)
		do {
			topElementPosition += element.offsetTop;
			// eslint-disable-next-line
		} while (element = element.offsetParent as HTMLElement);

	window.scrollTo({ top: topElementPosition - (window.screen.height / 2), behavior: 'smooth' });
};

/**
 * Scrolls to the top of the HTML Document.
 */
export const scrollToTop = (): void => window.scrollTo({ top: 0, behavior: 'smooth' });