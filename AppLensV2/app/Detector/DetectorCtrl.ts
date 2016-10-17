﻿///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class DetectorCtrl {

        public static $inject: string[] = ["DetectorsService", "$stateParams", "SiteService", "$window"];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private SiteService: ISiteService, private $window: angular.IWindowService) {

            var self = this;
            this.detectorName = this.$stateParams.detectorName.toLowerCase();
            
            if (!angular.isDefined(this.$stateParams.startTime)) {
                this.$stateParams.startTime = '';
            }

            if (!angular.isDefined(this.$stateParams.endTime)) {
                this.$stateParams.endTime = '';
            }

            if (!angular.isDefined(this.$stateParams.timeGrain)) {
                this.$stateParams.timeGrain = '';
            }
            
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.chartOptions = helper.GetChartOptions(this.detectorName);

            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                self.DetectorsService.getDetectors(self.site).then(function (data: DetectorDefinition[]) {
                    self.detectorInfo = _.find(data, function (item: DetectorDefinition) {
                        return item.Name.toLowerCase() === self.detectorName;
                    });
                });

                self.DetectorsService.getDetectorResponse(self.site, self.detectorName, self.$stateParams.startTime, self.$stateParams.endTime, self.$stateParams.timeGrain).then(function (data: DetectorResponse) {
                    self.detectorResponse = data;
                    self.chartData = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, self.detectorName);
                    self.dataLoading = false;
                });

                self.DetectorsService.getDetectorWiki(self.detectorName).then(function (wikiResponse) {
                    self.wikiContent = wikiResponse;
                });

                self.DetectorsService.getDetectorSolution(self.detectorName).then(function (solutionResponse) {
                    self.solutionContent = solutionResponse;
                });
            });
        }

        public detectorResponse: DetectorResponse;
        private detectorName: string;
        private site: Site;
        chartOptions: any;
        chartData: any;
        dataLoading: Boolean = true;
        detectorInfo: DetectorDefinition;
        wikiContent: string;
        solutionContent: string;
    }
}