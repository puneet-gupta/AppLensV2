///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SiaResponse {
        constructor(
            public StartTime: string,
            public EndTime: string,
            public AbnormalTimePeriods: AbnormalTimePeriod[],
            public Payload: AnalysisData[]
        ) {
        }
    }

    export class AbnormalTimePeriod {
        constructor(
            public StartTime: string,
            public EndTime: string,
            public Events: DetectorAbnormalTimePeriod[]
        ) {
        }
    }

    export class AnalysisData {
        constructor(
            public Source: string,
            public Metrics: DiagnosticMetricSet[],
            public Data: NameValuePair[][]
        ) {
        }
    }
}