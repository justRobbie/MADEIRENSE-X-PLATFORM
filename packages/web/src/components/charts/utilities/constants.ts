import type {
    chartOptionsType
} from "../types";

// ***************************************************************************************************************

export const CHART_COLOR_MAP = [
    // Accent 1 (Gold) - bright tones
    "#ffd700", "#ffe033", "#ffea66", "#fff399", "#fffcc2",

    // Accent 2 (Navy) - lighter blues
    "#0063b3", "#0074cc", "#3399ff", "#66b2ff", "#99ccff",

    // Accent 3 (Bronze) - warm highlights
    "#c68f5c", "#d39e6e", "#e0ad80", "#edbc92", "#facaad",

    // Accent 4 (Red) - vibrant reds and pinks
    "#ff3333", "#ff6666", "#ff9999", "#ffcccc", "#ffe5e5",

    // Mixed hues with high brightness
    "#00ff33", "#00ff66", "#00ff99", "#00ffcc", "#00ffff",
    "#00ccff", "#0099ff", "#0066ff", "#0033ff", "#3300ff",

    // Desaturated pastels
    "#d4af37", "#e3c565", "#c4a484", "#a585a3", "#8676c2"
];

export const CHART_COLOR_DEFINITIONS: chartOptionsType = {
    legendLabelColor: "#000",
    gridColor: "#b9804a59",
    ticksColor: "#000",
    titleColor: "#b9804a",
};