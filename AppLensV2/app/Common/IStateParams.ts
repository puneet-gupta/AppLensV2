///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IStateParams extends angular.ui.IStateParamsService {
        stamp: string;
        siteName: string;
        startTime: string;
        endTime: string;
        timeGrain: string;
        detectorName: string;
        analysisType: string;
    }
}