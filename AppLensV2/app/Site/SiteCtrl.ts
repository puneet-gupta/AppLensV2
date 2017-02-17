///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SiteCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "SiaService", "$mdSidenav", "SiteService", "$stateParams", "$state", "$window", "$mdPanel", "FeedbackService", "$mdToast", "ErrorHandlerService", "$mdDialog", "bowser"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private SiaService: ISiaService, private $mdSidenav: angular.material.ISidenavService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private ErrorHandlerService: IErrorHandlerService, private $mdDialog: angular.material.IDialogService, private bowser: any) {

            this.avaiabilityChartData = [];
            this.requestsChartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.availabilityChartOptions = helper.GetChartOptions('runtimeavailability');
            this.requestsChartOptions = helper.GetChartOptions('runtimeavailability');
            this.latencyChartOptions = helper.GetChartOptions('sitelatency');
            this.containerHeight = this.$window.innerHeight * 0.25 + 'px';

            if (!angular.isDefined(this.$stateParams.siteName) || this.$stateParams.siteName === '') {
                // TODO: show error or redirect to home page.
            }

            if (!angular.isDefined(this.$stateParams.startTime)) {
                this.$stateParams.startTime = '';
            }

            if (!angular.isDefined(this.$stateParams.endTime)) {
                this.$stateParams.endTime = '';
            }

            if (!angular.isDefined(this.$stateParams.timeGrain)) {
                this.$stateParams.timeGrain = '';
            }

            var self = this;
            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                self.getRuntimeAvailability();
                self.getSiteLatency();

                self.DetectorsService.getDetectors(self.site).then(function (data: DetectorDefinition[]) {
                    self.detectors = self.DetectorsService.detectorsList;

                    self.SiaService.getAppAnalysisResponse(self.site, self.$stateParams.startTime, self.$stateParams.endTime, self.$stateParams.timeGrain).then(function (data: any) {
                        var siaResponse = self.SiaService.appAnalysisResponse;
                        _.each(siaResponse.NonCorrelatedDetectors, function (item: any) {
                            _.each(self.detectors, function (detector: any) {
                                if (item.DisplayName == detector.DisplayName)
                                    detector.Correlated = 0;
                            });
                        });

                        _.each(siaResponse.Payload, function (item: any) {
                            _.each(self.detectors, function (detector: any) {
                                if (item.DetectorDefinition.DisplayName == detector.DisplayName)
                                    detector.Correlated = 1;
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
        selectedItem: string;
        site: Site;
        availabilityChartOptions: any;
        avaiabilityChartData: any;
        requestsChartOptions: any;
        latencyChartData: any;
        latencyChartOptions: any;
        requestsChartData: any;
        dataLoading: boolean = true;
        containerHeight: string;

        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        private getRuntimeAvailability(): void {

            var self = this;
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            this.DetectorsService.getDetectorResponse(this.site, 'runtimeavailability', this.$stateParams.startTime, this.$stateParams.endTime, this.$stateParams.timeGrain).then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, 'runtimeavailability');
                
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

            this.DetectorsService.getDetectorResponse(this.site, sitelatency, this.$stateParams.startTime, this.$stateParams.endTime, this.$stateParams.timeGrain).then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, sitelatency);
                //self.dataLoading = false;
                var iterator = 0;
                var requestsIterator = 0;

                _.each(chartDataList, function (item: any) {
                    item.color = DetectorViewHelper.runtimeAvailabilityColors[iterator];
                    self.latencyChartData.push(item);
                });
            }, function (err) {
                //self.dataLoading = false;
                self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
            });
        }
    }
}