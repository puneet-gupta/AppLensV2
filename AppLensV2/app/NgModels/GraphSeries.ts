///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class GraphSeries {
        constructor(
            public key: string,
            public instance: string,
            public values: GraphPoint[]
        ) {
        }
    }

    export class GraphPoint {
        constructor(
            public x: any,
            public y: any
        ) {
        }
    }

    export class DetailedGraphData {
        constructor(
            public instanceList: string[] = [],
            public processList: string[] = [],
            public metricData: GraphSeries[] = [],
            public processesRemovedPerWorker: any = {}
        ) {
        }
    }
}