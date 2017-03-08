///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ITimeParamsService {
        StartTime: string;
        EndTime: string;
        TimeGrain: string;
        IsInternal: string;
    }

    export class TimeParamsService implements ITimeParamsService {

        public static $inject: string[] = ["$stateParams"];

        public StartTime: string;
        public EndTime: string;
        public TimeGrain: string;
        public IsInternal: string;

        constructor(private $stateParams: IStateParams) {
            let endTimeOrig: Date = new Date();
            let defaultEndTime: Date = new Date(endTimeOrig.getFullYear(), endTimeOrig.getMonth(), endTimeOrig.getDate(), endTimeOrig.getHours(), endTimeOrig.getMinutes());
            let defaultStartTime: Date = new Date(defaultEndTime.getFullYear(), defaultEndTime.getMonth(), defaultEndTime.getDate() - 1, defaultEndTime.getHours(), defaultEndTime.getMinutes());
            let defaultTimeGrain: string = "PT5M"

            this.StartTime = angular.isDefined(this.$stateParams.startTime) ? this.$stateParams.startTime : defaultStartTime.toISOString();
            this.EndTime = angular.isDefined(this.$stateParams.startTime) ? this.$stateParams.startTime : defaultStartTime.toISOString();
            this.TimeGrain = angular.isDefined(this.$stateParams.timeGrain) ? this.$stateParams.timeGrain : defaultTimeGrain;

            this.IsInternal = angular.isDefined(this.$stateParams.isInternal) ? this.$stateParams.isInternal : 'true';
        }
    }

}