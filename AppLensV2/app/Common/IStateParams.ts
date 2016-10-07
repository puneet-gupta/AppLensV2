///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IStateParams extends angular.ui.IStateParamsService {
        siteName: string;
        startTime: string;
        endTime: string;
        detectorName: string;
    }
}