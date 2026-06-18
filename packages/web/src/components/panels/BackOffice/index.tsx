import { 
    Suspense,
    type ComponentProps
} from "react";

import { 
    useLocation
} from "react-router-dom";

import { resolveClassNames } from "@Madeirense/shared";

import Icon from "components/icon";
import AnchorButton from "components/buttons/anchor";

import styles from "./index.module.css";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"section"> {
    enabled?: boolean;
};

function BackOfficePanel({
    className,
    children,
    enabled = false,
    ...props
}: IPropTypes) {
    const location = useLocation();

    const backLink = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

    const fallback = <div className="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center">
        <Icon name="Loading" className="animate-spin" />
    </div>;

    return <section 
        className={resolveClassNames(styles.panel, className)} 
        {...{ ...(enabled) ? { "data-enabled": "" } : {} }}
        {...props}
    >
        <header className="w-full flex flex-row justify-start items-center gap-4">
            <AnchorButton variant="secondary" to={backLink}>
                <Icon name="ChevronLeft" />
            </AnchorButton>

            <h2>Voltar</h2>
        </header>

        <Suspense {...{ fallback }}>
            {children}
        </Suspense>
    </section>
};

export default BackOfficePanel;