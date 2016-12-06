///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class Site {
        constructor(
            public name: string,
            public subscriptionId: string,
            public resourceGroup: string,
            public hostNames: string[],
            public stampName: string,
            public kind: string
        ) {
        }

        sku: string;
        stack: string;
        isLocalCacheEnabled: string;
        numberOfContinousWebJobs: number;
        numberOfTriggeredWebJobs: number;
        numberOfSlots: number;
        isLinux: boolean;
    }
}