///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ITopLevelSignalCtrl {
        getTemplateUrl(): string;
    }

    export interface ITopLevelSignalScope extends ng.IScope {
        template: string;
        getTemplateUrl(): string;
    }

    export class TopLevelSignalCtrl implements ITopLevelSignalCtrl {
        public static $inject: string[] = ["DetectorsService", "$stateParams", "$window", "ResourceServiceFactory", 'ErrorHandlerService'];
        public analysisType: string;
        public topLevelDetectorName: string;
        public viewHelper: DetectorViewHelper;
        public dataLoading: boolean;
        public containerHeight: string;
        public resourceService: IResourceService;
        public chartOptions: any;
        public chartData: any;

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private $window: angular.IWindowService, private resourceServiceFactory: ResourceServiceFactory, private ErrorHandlerService: IErrorHandlerService) {
            let self = this;
            this.analysisType = this.$stateParams.analysisType;
            let viewHelper = new DetectorViewHelper(this.$window);
            this.containerHeight = this.$window.innerHeight * 0.25 + 'px';
            let resourceService = this.resourceServiceFactory.GetResourceService();

            switch (this.$stateParams.analysisType) {
                case Constants.deploymentAnalysis:
                    self.topLevelDetectorName = "asedeployment";
                    break;
                case Constants.aseAvailabilityAnalysis:
                    self.topLevelDetectorName = "overallruntimeavailability";
                    break;
            }

            resourceService.promise.then(function (data: any) {
                DetectorsService.getDetectorResponse(resourceService.resource, self.topLevelDetectorName).then(function (detectorResponse: DetectorResponse) {
                    self.chartOptions = viewHelper.GetChartOptions(self.topLevelDetectorName, DetectorsService, resourceService.resource);
                    self.chartData = viewHelper.GetChartData(detectorResponse.StartTime, detectorResponse.EndTime, detectorResponse.Metrics, self.topLevelDetectorName);
                    self.chartOptions.chart.height = self.chartOptions.chart.height + (self.chartData.length / 8) * 20;
                    self.chartOptions.chart.margin.top = 20 + (self.chartData.length / 8) * 20;
                });
            });
        }

        getTemplateUrl(): string {
            return "app/TopLevelSignal/deployment-toplevelview.html";
        }

        getChartOptions(): any {
            let self = this;
            let chartOptions = self.viewHelper.GetChartOptions(self.topLevelDetectorName);
            chartOptions.chart.height = chartOptions.chart.height + (self.chartData.length / 8) * 20;
            self.chartOptions.chart.margin.top = 20 + (self.chartData.length / 8) * 20;
            return this.viewHelper.GetChartOptions(this.topLevelDetectorName);
        }

        getChartData(): any {
            let self = this;
            self.resourceService.promise.then(function (data: any) {
                self.DetectorsService.getDetectorResponse(self.resourceService.resource, self.topLevelDetectorName).then(function (data: DetectorResponse) {
                    let chartDataList: any = self.viewHelper.GetChartData(data.StartTime, data.EndTime, data.Metrics, self.topLevelDetectorName);
                    self.dataLoading = false;
                    return chartDataList;
                }, function (err) {
                    self.dataLoading = false;
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
            }, function (err) {

            });
        }
    }

    export class TopLevelSignalDir implements ng.IDirective {
        restrict = 'E';
        templateUrl = './app/TopLevelSignal/placeholder.html';
        controller = TopLevelSignalCtrl;
        controllerAs = "ctrl";
        public link = function (ctrl: ITopLevelSignalCtrl) {
        }
    }
}