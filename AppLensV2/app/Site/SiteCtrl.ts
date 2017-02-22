///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SiteCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "SiaService", "$mdSidenav", "SiteService", "$stateParams", "$state", "$window", "$mdPanel", "FeedbackService", "$mdToast", "ErrorHandlerService", "$mdDialog", "bowser"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private SiaService: ISiaService, private $mdSidenav: angular.material.ISidenavService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private ErrorHandlerService: IErrorHandlerService, private $mdDialog: angular.material.IDialogService, private bowser: any) {

            this.avaiabilityChartData = [];
            this.requestsChartData = [];
            this.latencyChartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.availabilityChartOptions = helper.GetChartOptions('runtimeavailability');
            this.requestsChartOptions = helper.GetChartOptions('runtimeavailability');
            this.latencyChartOptions = helper.GetChartOptions('sitelatency');
            this.containerHeight = this.$window.innerHeight * 0.25 + 'px';

            this.analysisType = this.$state.current.name.indexOf('appAnalysis') > 0 ? 'app': 'perf';

            if (!angular.isDefined(this.$stateParams.siteName) || this.$stateParams.siteName === '') {
                // TODO: show error or redirect to home page.
            }

            var self = this;
            this.SiteService.promise.then(function (data: any) {
                self.getRuntimeAvailability();
                self.getSiteLatency();

                self.DetectorsService.getDetectors().then(function (data: DetectorDefinition[]) {
                    self.detectors = self.DetectorsService.detectorsList;

                    self.SiaService.getAppAnalysisResponse().then(function (data: any) {
                        var siaResponse = self.SiaService.appAnalysisResponse;
                        _.each(siaResponse.NonCorrelatedDetectors, function (item: DetectorDefinition) {
                            _.each(self.DetectorsService.detectorsList, function (detector: DetectorDefinition) {
                                if (item.DisplayName == detector.DisplayName) {
                                    detector.Correlated = 0;
                                }
                            });
                        });

                        _.each(siaResponse.Payload, function (item: AnalysisData) {
                            _.each(self.DetectorsService.detectorsList, function (detector: DetectorDefinition) {
                                if (item.DetectorDefinition.DisplayName == detector.DisplayName) {
                                    detector.Correlated = 1;
                                }
                            });
                        });
                    }, function (err) {
                        // Error in App Analysis
                        self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                    });

                }, function (err) {
                    // Error in GetDetectors
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
            }, function (err) {
                // Error in calling Site Details
                self.dataLoading = false;
            });
        }

        detectors: DetectorDefinition[];
        availabilityChartOptions: any;
        avaiabilityChartData: any;
        requestsChartOptions: any;
        latencyChartData: any;
        latencyChartOptions: any;
        requestsChartData: any;
        dataLoading: boolean = true;
        perfDataLoading: boolean = true;
        containerHeight: string;
        analysisType: string;

        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        private getRuntimeAvailability(): void {

            var runtimeavailability = 'runtimeavailability';
            var self = this;
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            this.DetectorsService.getDetectorResponse(runtimeavailability).then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, runtimeavailability);
                
                var iterator = 0;
                var requestsIterator = 0;
                _.each(chartDataList, function (item: any) {
                    var f: string;
                    if (item.key.toLowerCase().indexOf("availability") !== -1) {
                        item.color = DetectorViewHelper.runtimeAvailabilityColors[iterator];
                        iterator++;
                        self.avaiabilityChartData.push(item);
                    }
                    else {
                        item.area = true;
                        item.color = DetectorViewHelper.requestsColors[requestsIterator];
                        requestsIterator++;
                        self.requestsChartData.push(item);
                    }

                });

                self.dataLoading = false;
            }, function (err) {
                self.dataLoading = false;
                self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
            });
        }

        // Not using Site Latency yet 
        private getSiteLatency(): void {

            var sitelatency = 'sitelatency';
            var self = this;
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            this.DetectorsService.getDetectorResponse(sitelatency).then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, sitelatency);
                self.perfDataLoading = false;
                var iterator = 0;
                var requestsIterator = 0;

                _.each(chartDataList, function (item: any) {
                    item.color = DetectorViewHelper.runtimeAvailabilityColors[iterator];
                    self.latencyChartData.push(item);
                });
            }, function (err) {
                self.perfDataLoading = false;
                self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
            });
        }
    }
}