import {
    isValidElement,
    type ReactNode
} from "react";

// ***************************************************************************************************************

/**
 * Returns true if the node is the expected element.
 * @param child A react node.
 * @param element The expected element.
 * @returns {boolean}
 */
export const isElement = (child: ReactNode, ...elements: ReadonlyArray<keyof HTMLElementTagNameMap>): boolean => {
    return (
        isValidElement(child) &&
        typeof child.type === "string" &&
        elements.includes(child.type as any)
    );
};
