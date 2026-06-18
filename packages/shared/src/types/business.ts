import type { Orders } from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type processReportType = Record<reportType, Error | null>;

export type processJobType = {
    deliveries: ReadonlyArray<Orders>
};

export type processType = {
    reports: processReportType,
    processes: processJobType
};

export type reportType = (
    | "deliveries"
);