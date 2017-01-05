///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class DetectorCtrl {

        public static $inject: string[] = ["DetectorsService", "$stateParams", "SiteService", "$window", "ErrorHandlerService"];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private SiteService: ISiteService, private $window: angular.IWindowService, private ErrorHandlerService: IErrorHandlerService) {

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

                    self.chartOptions.chart.height =
                        self.chartOptions.chart.height + (self.chartData.length / 8) * 20;
                    self.chartOptions.chart.margin.top = 20 + (self.chartData.length / 8) * 20;
                    if (self.detectorName === 'cpuanalysis' || self.detectorName === 'memoryanalysis') {
                        self.chartOptions.chart.yAxis.axisLabel = 'Percent';
                    }
                    self.dataLoading = false;
                }, function (err) {
                    self.dataLoading = false;
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
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
        private site: Site;
        detectorName: string;
        chartOptions: any;
        chartData: any;
        dataLoading: Boolean = true;
        detectorInfo: DetectorDefinition;
        wikiContent: string;
        solutionContent: string;
    }
}