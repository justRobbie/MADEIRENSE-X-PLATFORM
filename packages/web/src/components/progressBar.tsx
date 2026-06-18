import { 
    type ComponentProps,
    type CSSProperties
} from 'react';

import { 
    resolveClassNames
} from '@Madeirense/shared';

import styles from './progressBar.module.css';

import type { withVariant } from './types';

// ***************************************************************************************************************

interface IProgressProps extends ComponentProps<"div"> {
    animated?: boolean;
    value: number;
}

const ProgressBar = ({
    animated = false,
    className,
    value,
    variant = "primary",
    ...props
}: withVariant<IProgressProps>) => {
    const width = `${value}%`;

    const $divStyle: CSSProperties = {
        width,
        maxWidth: width,
        minWidth: width,
    };

    return <div
        className={resolveClassNames(
            styles[variant],
            (animated) ? styles.animated : "",
            className
        )}
        {...props}
    >
        <div style={$divStyle}>
        </div>
    </div>
};

export default ProgressBar;