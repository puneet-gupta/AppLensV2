///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class MainCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "SiaService", "$mdSidenav", "SiteService", "$stateParams", "$state", "$window", "$mdPanel", "FeedbackService", "$mdToast", "ErrorHandlerService", "$mdDialog"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private SiaService: ISiaService, private $mdSidenav: angular.material.ISidenavService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private ErrorHandlerService: IErrorHandlerService, private $mdDialog: angular.material.IDialogService) {
            this.avaiabilityChartData = [];
            this.requestsChartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.availabilityChartOptions = helper.GetChartOptions('runtimeavailability');
            this.requestsChartOptions = helper.GetChartOptions('runtimeavailability');
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

                var sitesWithSameHostname = self.SiteService.sites;

                if (sitesWithSameHostname.length > 1) {
                    self.showSitesDialog();
                }

                self.getRuntimeAvailability();

                self.DetectorsService.getDetectors(self.site).then(function (data: DetectorDefinition[]) {
                    self.detectors = data;
                    self.detectorListLoaded = true;

                    self.SiaService.getAppAnalysisResponse(self.site, self.$stateParams.startTime, self.$stateParams.endTime, self.$stateParams.timeGrain).then(function (data: any) {
                        //do stuff here with siaResponse
                        var siaResponse = self.SiaService.siaResponse;
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
                        self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                    });

                }, function (err) {
                    self.detectorListLoaded = true;
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
            }, function (err) {
                // Error in calling Site Details

                self.detectorListLoaded = true;
                self.dataLoading = false;
            });

            // if no child route is defined, then set default child route to sia
            if (this.$state.current.name.indexOf('home') >= 0) {
                this.setSelectedItem('sia');
            }
            if (this.$state.current.name.indexOf('.sia') >= 0) {
                this.selectedItem = "sia";
            } else if (this.$state.current.name.indexOf('.detector') >= 0) {
                this.selectedItem = this.$state.params['detectorName'];
            }
        }

        detectors: DetectorDefinition[];
        detectorListLoaded: boolean = false;
        selectedItem: string;
        site: Site;
        availabilityChartOptions: any;
        avaiabilityChartData: any;
        requestsChartOptions: any;
        requestsChartData: any;
        dataLoading: boolean = true;
        containerHeight: string;

        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        setSelectedItem(name: string): void {
            if (name === 'sia') {
                this.selectedItem = "sia";
                if (this.$state.current.name.indexOf('home2') >= 0) {
                    this.$state.go('home2.sia');
                } else {
                    this.$state.go('home.sia');
                }
            }
            else {
                this.selectedItem = name;
                if (this.$state.current.name.indexOf('home2') >= 0) {
                    if ((this.$state.current.name !== 'home2.detector') || (this.$state.current.name === 'home2.detector' && this.$state.params['detectorName'] !== name)) {
                        this.$state.go('home2.detector', { detectorName: name });
                    }
                } else {
                    if ((this.$state.current.name !== 'home.detector') || (this.$state.current.name === 'home.detector' && this.$state.params['detectorName'] !== name)) {
                        this.$state.go('home.detector', { detectorName: name });
                    }
                }
            }

            var sidenav = this.$mdSidenav('left');
            if (sidenav.isOpen()) {
                sidenav.close();
            }
        }

        sendFeedback(): void {
            this.FeedbackService.sendGeneralFeedback();
        }

        private getRuntimeAvailability(): void {

            var self = this;
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            this.DetectorsService.getDetectorResponse(this.site, 'runtimeavailability', this.$stateParams.startTime, this.$stateParams.endTime, this.$stateParams.timeGrain).then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, 'runtimeavailability');
                self.dataLoading = false;
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
            }, function (err) {
                self.dataLoading = false;
                self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
            });
        }

        showAppProfile(): void {
            var position = this.$mdPanel.newPanelPosition()
                .absolute()
                .center();

            var config = {
                attachTo: angular.element(document.body),
                controllerAs: 'appprofilectrl',
                controller: AppProfileCtrl,
                disableParentScroll: true,
                templateUrl: 'appprofile.html',
                hasBackdrop: true,
                panelClass: 'app-profile-dialog',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true
            };

            this.$mdPanel.open(config);

        }

        showSitesDialog(): void {
            var position = this.$mdPanel.newPanelPosition()
                .absolute()
                .center();

            var config = {
                attachTo: angular.element(document.body),
                controllerAs: 'multiplesitesctrl',
                controller: MultipleSitesCtrl,
                disableParentScroll: true,
                templateUrl: 'multiplesites.html',
                hasBackdrop: true,
                panelClass: 'multiple-sites-dialog',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true
            };

            this.$mdPanel.open(config);
        }

        showCaseFeedbackForm(ev): void {

            let self = this;

            this.$mdDialog.show({
                controllerAs: 'casefeedbackctrl',
                controller: CaseFeedbackCtrl,
                templateUrl: 'supportcasefeedback.html',
                parent: angular.element(document.body),
                hasBackdrop: true,
                targetEvent: ev,
                clickOutsideToClose: true,
                disableParentScroll: true,
                escapeToClose: true,
                focusOnOpen: false
            })
                .then(function (answer) {
                    if (angular.isDefined(answer) && answer === true) {
                        self.$mdToast.showSimple("Feedback submitted successfully.Thank you !!");
                    }
                }, function () {
                });
        }
    }

    export class AppProfileCtrl {

        constructor(private SiteService: ISiteService) {
            var self = this;
            this.logo = "app/assets/images/Azure-WebApps-Logo.png";
            this.properties = [];
            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;
                if (self.site.kind === 'functionapp') {
                    self.logo = "app/assets/images/Azure-Functions-Logo.png";
                }

                self.properties.push(new NameValuePair("Subscription Id", self.site.subscriptionId));
                self.properties.push(new NameValuePair("Resource Group", self.site.resourceGroup));
                self.properties.push(new NameValuePair("Stamp Name", self.site.internalStampName));
                self.properties.push(new NameValuePair("Hostnames", self.site.hostNames.join()));
                self.properties.push(new NameValuePair("App Stack", self.site.stack));
                self.properties.push(new NameValuePair("SKU", self.site.sku));
                self.properties.push(new NameValuePair("Is Linux?", self.site.isLinux.toString()));
                self.properties.push(new NameValuePair("Number Of Continuous WebJobs", self.site.numberOfContinousWebJobs.toString()));
                self.properties.push(new NameValuePair("Number of Triggered WebJobs", self.site.numberOfTriggeredWebJobs.toString()));
            });
        }

        site: Site;
        logo: string;
        properties: NameValuePair[]
    }

    export class CaseFeedbackCtrl {

        public static $inject: string[] = ["$mdDialog", "FeedbackService"];

        constructor(private $mdDialog: angular.material.IDialogService, private FeedbackService: IFeedbackService) {
            this.feedbackOption = 0;
        }

        submitFeedback(): void {

            if (!angular.isDefined(this.caseNumber) || this.caseNumber === '') {
                return;
            }

            if (!angular.isDefined(this.additionalNotes)) {
                this.additionalNotes = '';
            }

            var self = this;
            this.FeedbackService.sendCaseFeedback(this.caseNumber, this.feedbackOption, this.additionalNotes)
                .then(function (answer) {
                    self.$mdDialog.hide(true);
                }, function (err) {
                    self.$mdDialog.hide(false);
                });
        }

        caseNumber: string;
        feedbackOption: number;
        additionalNotes: string;

    }
}