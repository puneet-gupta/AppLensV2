///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class DetectorResponse {
        constructor(
            public StartTime: string,
            public EndTime: string,
            public Metrics: DiagnosticMetricSet[],
            public Data: NameValuePair[][]
        ) {
        }
    }

    export class DetectorAbnormalTimePeriod {
        constructor(
            public StartTime: string,
            public EndTime: string,
            public Message: string = '',
            public Source: string = '',
            public Priority: number = 0
        ) {
        }
    }

    export class DiagnosticMetricSet {
        constructor(
            public Name: string,
            public Unit: string,
            public StartTime: string,
            public EndTime: string,
            public TimeGrain: string,
            public Values: DiagnosticMetricSample[]
        ) {
        }
    }

    export class DiagnosticMetricSample {
        constructor(
            public Timestamp: string,
            public Total: number
        ) {
        }
    }

    export class NameValuePair {
        constructor(
            public Name: string,
            public Value: string
        ) {
        }
    }
}