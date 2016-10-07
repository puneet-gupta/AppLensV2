///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class Site {
        constructor(
            public name: string,
            public subscriptionId: string,
            public resourceGroup: string,
            public hostNames: string[],
            public stampName: string
        ) {
        }
    }
}