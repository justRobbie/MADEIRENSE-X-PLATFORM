import {
    Chart as ChartJS,
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
} from "chart.js";

import { Line } from "react-chartjs-2";

import { generateRGBColor, which } from "@Madeirense/shared";

import {
    CHART_COLOR_DEFINITIONS
} from "../utilities/constants";

import type { chartOptionsType } from "../types";

// ***************************************************************************************************************

interface ILineChartProps {
    data: number[];
    labels: string[];
    label?: string;
    options?: chartOptionsType;
    showAllTicks?: boolean,
    showAllTicksOnXAxis?: boolean,
    showAllTicksOnYAxis?: boolean,
    showWholeNumbers?: boolean;
    showWholeNumbersOnXAxis?: boolean;
    showWholeNumbersOnYAxis?: boolean;
}

ChartJS.register(
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
);

function LineChart({
    data,
    labels,
    label = "O gráfico",
    options = {},
    showWholeNumbers = false,
    showWholeNumbersOnXAxis = false,
    showWholeNumbersOnYAxis = false
}: ILineChartProps) {
    const colors = new Map([
        [
            "BACKGROUND",
            which(options?.backgroundColor, CHART_COLOR_DEFINITIONS.backgroundColor, undefined)
        ],
        [
            "BORDER",
            which(options?.borderColor, CHART_COLOR_DEFINITIONS.borderColor, generateRGBColor())
        ],
        [
            "LEGEND_LABEL",
            which(options?.legendLabelColor, CHART_COLOR_DEFINITIONS.legendLabelColor, undefined)
        ],
        [
            "GRID",
            which(options?.gridColor, CHART_COLOR_DEFINITIONS.gridColor, undefined)
        ],
        [
            "POINT_BORDER",
            which(options?.pointBorderColor, CHART_COLOR_DEFINITIONS.pointBorderColor, undefined)
        ],
        [
            "POINT_BACKGROUND",
            which(options?.pointBackgroundColor, CHART_COLOR_DEFINITIONS.pointBackgroundColor, undefined)
        ],
        [
            "TICKS",
            which(options?.ticksColor, CHART_COLOR_DEFINITIONS.ticksColor, undefined)
        ]
    ]);

    const parseNumber = (tickValue: string | number) => Number.isInteger(tickValue) ? tickValue : null;

    const DEFAULT_SCALES_OPTIONS = {
        grid: {
            color: colors.get("GRID")
        },
        min: 0,
        ticks: {
            color: colors.get("TICKS"),
            ...(showWholeNumbers ? { callback: parseNumber } : undefined)
        },
    };

    return <Line
        data={{
            datasets: [{
                data,
                label,
                backgroundColor: colors.get("BACKGROUND"),
                borderColor: colors.get("BORDER"),
                pointBorderColor: colors.get("POINT_BORDER"),
                pointBackgroundColor: colors.get("POINT_BACKGROUND"),
                tension: options.tension || undefined
            }],
            labels,
        }}
        options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: colors.get("LEGEND_LABEL")
                    }
                }
            },
            scales: {
                x: {
                    ...DEFAULT_SCALES_OPTIONS,
                    ticks: {
                        ...DEFAULT_SCALES_OPTIONS.ticks,
                        ...(showWholeNumbersOnXAxis
                            ? {
                                callback: parseNumber
                            }
                            : undefined
                        )
                    }
                },
                y: {
                    ...DEFAULT_SCALES_OPTIONS,
                    ticks: {
                        ...DEFAULT_SCALES_OPTIONS.ticks,
                        ...(showWholeNumbersOnYAxis
                            ? {
                                callback: parseNumber
                            }
                            : undefined
                        )
                    }
                }
            }
        }}
    />
};

export default LineChart;