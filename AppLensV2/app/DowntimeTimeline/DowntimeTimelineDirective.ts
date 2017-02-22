///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDowntimeTimelineViewScope extends ng.IScope {
        height: string;
        singleabnormaltimeperiod: AbnormalTimePeriod;
    }

    export interface IDowntimeTimelineCtrl {
        selectDowntime(index: number): void;
    }

    export class DowntimeTimelineCtrl implements IDowntimeTimelineCtrl {
        public static $inject: string[] = ["SiaService", "SiteService", "$stateParams", "$state"];
        public loading: boolean = true;
        public singleabnormaltimeperiod: AbnormalTimePeriod;
        public allTimePeriods: any[] = [];
        public SiaResponse: SiaResponse;
        public selectedDowntime: any;

        constructor(private SiaService: ISiaService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService) {
            var self = this;
            this.SiteService.promise.then(function (data: any) {
                var site = self.SiteService.site;

                if ($state.current.name.indexOf("perfanalysis")) {
                    SiaService.getPerfAnalysisResponse().then(function (data) {
                        self.SiaResponse = SiaService.perfAnalysisResponse;
                        self.PrepareDowntimes();
                    });
                }
                else {
                    SiaService.getAppAnalysisResponse().then(function (data) {
                        self.SiaResponse = SiaService.appAnalysisResponse;
                        self.PrepareDowntimes();
                    });
                }
            });
        }

        private PrepareDowntimes(): void {
            var self = this;
            var startTime = new Date(self.SiaResponse.StartTime);
            var endTime = new Date(self.SiaResponse.EndTime);
            var fullDuration = endTime.getTime() - startTime.getTime();
            if (angular.isDefined(self.singleabnormaltimeperiod)) {
                var abnormalStartTime = new Date(self.singleabnormaltimeperiod.StartTime);
                var abnormalEndTime = new Date(self.singleabnormaltimeperiod.EndTime);

                self.allTimePeriods.push({
                    percent: ((abnormalStartTime.getTime() - 300000) - startTime.getTime()) / fullDuration * 100,
                    downtime: false,
                    index: -1
                });

                self.allTimePeriods.push({
                    percent: (abnormalEndTime.getTime() - (abnormalStartTime.getTime() - 300000)) / fullDuration * 100,
                    downtime: true,
                    index: -2
                });

                self.allTimePeriods.push({
                    percent: (endTime.getTime() - abnormalEndTime.getTime()) / fullDuration * 100,
                    downtime: false,
                    index: -1
                });
            }
            else {
                var start = startTime;
                var abnormalTimePeriodCount = 0;
                _.each(self.SiaResponse.AbnormalTimePeriods, function (downtime) {
                    self.allTimePeriods.push({
                        percent: (new Date(downtime.StartTime).getTime() - 300000 - start.getTime()) / fullDuration * 100,
                        downtime: false,
                        index: -1
                    });
                    self.allTimePeriods.push({
                        percent: (new Date(downtime.EndTime).getTime() - (new Date(downtime.StartTime).getTime() - 300000)) / fullDuration * 100,
                        downtime: true,
                        index: abnormalTimePeriodCount
                    });
                    abnormalTimePeriodCount++;
                    start = new Date(new Date(downtime.EndTime).getTime());
                });

                self.allTimePeriods.push({
                    percent: (endTime.getTime() - start.getTime()) / fullDuration * 100,
                    downtime: false,
                    index: -1
                });
            }
            self.selectedDowntime = self.SiaService.selectedAbnormalTimePeriod;
            self.loading = false;
        }

        public selectDowntime(index: number): void {
            if (index >= 0) {
                if (this.$state.current.name.indexOf("perfanalysis")) {
                    this.SiaService.selectPerfDowntime(index);
                }
                else {
                    this.SiaService.selectAppDowntime(index);
                }
            }
        }

    }

    export class DowntimeTimelineDir implements ng.IDirective {

        public restrict: string = 'E';
        public replace: boolean = true;
        public templateUrl: string = './app/DowntimeTimeline/downtimetimeline.html';
        public bindToController: boolean = true;
        public controllerAs: string = 'downtimetimeline';
        public controller = DowntimeTimelineCtrl;
        public link = function (scope: IDowntimeTimelineViewScope, ctrl: IDowntimeTimelineCtrl) {
        }

        public scope: { [boundProperty: string]: string } = {
            height: '=',
            singleabnormaltimeperiod: '='
        };
    }
}