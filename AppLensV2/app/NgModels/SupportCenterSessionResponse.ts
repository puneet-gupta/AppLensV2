///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SupportCenterEvent {
        constructor(
            public EventName: string,
            public Timestamp: string,
            public EventData: NameValuePair[]
        ) {
        }
    }

    export class SupportCenterSessionData {
        constructor(
            public SessionId: string,
            public Timestamp: string,
            public Events: SupportCenterEvent[]
        ) {
        }
    }

    export class SupportCenterTicketWorkflowData {
        constructor(
            public TicketWorkflowId: string,
            public Timestamp: string,
            public MsSolveCaseId: string,
            public Sessions: SupportCenterSessionData[]
        ) {
        }
    }
}