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

// ***************************************************************************************************************

interface IMultiLineChartProps {
    datasets: ({
        data: number[],
        borderColor?: string
        label?: string;
    })[],
    labels: string[];
};

ChartJS.register(
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
);

function MultiLineChart({
    datasets,
    labels,
}: IMultiLineChartProps) {
    return <Line
        data={{
            datasets,
            labels
        }}
        options={{
            responsive: true,
            maintainAspectRatio: true
        }}
    />
};

export default MultiLineChart;