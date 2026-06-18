import {
    Chart as ChartJS,
    ArcElement,
    Legend,
    Tooltip,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

import { 
    generateRGBColor, 
    which
} from "@Madeirense/shared";

import { CHART_COLOR_DEFINITIONS } from "./utilities/constants";

import type { chartOptionsType } from "./types";

// ***************************************************************************************************************

interface IDoughnutChartProps {
    data: number[];
    labels: string[];
    backgroundColor?: string[];
    borderColor?: string[];
    label?: string;
    options?: chartOptionsType;
}

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export const getColors = (length: number) => Array.from(Array(length), i => generateRGBColor());

function DoughnutChart({
    data,
    labels,
    backgroundColor = undefined,
    borderColor = undefined,
    label = "O gráfico",
    options = {}
}: IDoughnutChartProps) {
    const DEFAULT_COLOR_ARRAY = getColors(data.length);

    const colors = new Map([
        [
            "LEGEND_LABEL",
            which(options?.legendLabelColor, CHART_COLOR_DEFINITIONS.legendLabelColor, undefined)
        ]
    ]);

    return <Doughnut
        data={{
            datasets: [{
                data,
                label,
                borderColor: borderColor || DEFAULT_COLOR_ARRAY,
                borderWidth: options?.borderWidth || undefined,
                backgroundColor: backgroundColor || DEFAULT_COLOR_ARRAY,
            }],
            labels
        }}
        options={{
            plugins: {
                legend: {
                    labels: {
                        color: colors.get("LEGEND_LABEL")
                    },
                },
            },
            responsive: true,
            maintainAspectRatio: true
        }}
    />
};

export default DoughnutChart;