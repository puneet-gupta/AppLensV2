///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export abstract class Resource {
        subscriptionId: string;
        resourceGroup: string;
        resourceName: string;
        resourceInternalStamp: string;

        constructor(subscriptionId: string, resourceGroup: string, resourceName: string, resourceInternalStamp: string) {
            this.subscriptionId = subscriptionId;
            this.resourceGroup = resourceGroup;
            this.resourceName = resourceName;
            this.resourceInternalStamp = resourceInternalStamp;
        }
    }
}