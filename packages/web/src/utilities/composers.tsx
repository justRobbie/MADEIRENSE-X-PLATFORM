
type containerType = (props: any) => JSX.Element;

type containerObjectType = { JSX: containerType, props?: any };

interface ContainerComposerPropTypes {
    containers: containerObjectType[],
    children: any
};

/**
 * Wraps supplied children with an array of containers. You can pass props for each container if necessary.
 * 
 * @param props `containers` a list of JSX elements that funciton as containers for passed props to be wrapped around the component's `children`.
 * @returns {JSX}
 */
export const ContainerComposer = ({ containers, children }: ContainerComposerPropTypes) => {
	return containers.reduceRight(((acc: any, Container) => {
		const { JSX, props } = Container;

		return <JSX {...props}>{acc}</JSX>
	}), children);
};

interface ProviderComposerPropTypes {
    providers: Array<({ children }: any) => JSX.Element>,
    children: any
};

type ContextProviderType = ({ children }: any) => JSX.Element;

/**
 * Wraps supplied children with an array of context providers.
 * 
 * @param providers a list of context providers to wrap the children components with.
 */
export const ProviderComposer = ({ providers, children }: ProviderComposerPropTypes) => {
    return providers.reduceRight((( acc: any, Provider: ContextProviderType) => { return <Provider>{acc}</Provider> }), children);
};