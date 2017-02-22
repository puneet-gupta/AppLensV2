///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ITimeParamsService {
        StartTime: string;
        EndTime: string;
        TimeGrain: string;
    }

    export class TimeParamsService implements ITimeParamsService {

        public static $inject: string[] = ["$stateParams"];

        public StartTime: string;
        public EndTime: string;
        public TimeGrain: string;

        constructor(private $stateParams: IStateParams) {
            let endTimeOrig: Date = new Date();
            let defaultEndTime: Date = new Date(endTimeOrig.getFullYear(), endTimeOrig.getMonth(), endTimeOrig.getDate(), endTimeOrig.getHours(), endTimeOrig.getMinutes());
            let defaultStartTime: Date = new Date(defaultEndTime.getFullYear(), defaultEndTime.getMonth(), defaultEndTime.getDate() - 1, defaultEndTime.getHours(), defaultEndTime.getMinutes());
            let defaultTimeGrain: string = '';

            if (angular.isDefined(this.$stateParams.startTime) && angular.isDefined(this.$stateParams.endTime)) {
                this.StartTime = this.$stateParams.startTime;
                this.EndTime = this.$stateParams.endTime;
            }
            else if (angular.isDefined(this.$stateParams.startTime) && !angular.isDefined(this.$stateParams.endTime)) {
                this.StartTime = this.$stateParams.startTime;
                this.EndTime = '';
            }
            else if (!angular.isDefined(this.$stateParams.startTime) && angular.isDefined(this.$stateParams.endTime)) {
                this.StartTime = '';
                this.EndTime = this.$stateParams.endTime;
            }
            else {
                this.StartTime = defaultStartTime.toISOString();
                this.EndTime = defaultEndTime.toISOString();
            }

            this.TimeGrain = angular.isDefined(this.$stateParams.timeGrain) ? this.$stateParams.timeGrain : defaultTimeGrain;
        }

        private AddDaysToDate(date: Date, days: number) {
            var returnDate = new Date(date.valueOf());
            return returnDate.setDate(returnDate.getDate() + days);
        }
    }

}