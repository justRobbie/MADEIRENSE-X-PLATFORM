type CustomProviderType = ({ children }: any) => any;

interface IAppContextProviderProps {
    children: any;
    props?: any;
    providers: CustomProviderType[];
};

export const AppContextProvider = ({
    children,
    props,
    providers,
}: IAppContextProviderProps) => {
    const ContextProviderReducer = (acc: any, Provider: any) => {
        return <Provider {...props}> {acc} </Provider>
    };

    return <>{providers.reduceRight(ContextProviderReducer, children)}</>;
};