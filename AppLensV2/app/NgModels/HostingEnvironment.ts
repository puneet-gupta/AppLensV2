///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HostingEnvironment extends Resource {
        constructor(
            subscriptionId: string,
            resourceGroup: string,
            hostingEnvironmentName: string,
            internalStampName: string
        ) {
            super(subscriptionId, resourceGroup, hostingEnvironmentName, internalStampName);
        }
    }
}