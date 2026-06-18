import { 
	cloneElement, 
	Children
} from "react";

// ***************************************************************************************************************

interface IChildrenWithPropsPropTypes {
    childComponent: any,
    props: any
};

/**
 * (Component) Passes supplied `props` to the child component.
 * @param props `childComponent` is the component that will inherit the `props` you pass.
 * @returns {JSX}
 */
export const ChildrenWithProps = ({ childComponent, props }: IChildrenWithPropsPropTypes) => {
	return Children.map(childComponent, (child) => {
		return cloneElement(child, { ...props, ...child.props });
	});
};
