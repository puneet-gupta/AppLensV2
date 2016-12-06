///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class MainCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "$mdSidenav", "SiteService", "$stateParams", "$state", "$window", "$mdPanel"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private $mdSidenav: angular.material.ISidenavService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService) {
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
                
                self.getRuntimeAvailability();

                self.DetectorsService.getDetectors(self.site).then(function (data: DetectorDefinition[]) {
                    self.detectors = data;
                    self.detectorListLoaded = true;

                    self.DetectorsService.getAppAnalysisResponse(self.site, self.$stateParams.startTime, self.$stateParams.endTime, self.$stateParams.timeGrain).then(function (siaResponse: SiaResponse) {
                        //do stuff here with siaResponse
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
                    });

                });
            });

            // if no child route is defined, then set default child route to sia
            if (this.$state.current.name === 'home') {
                this.setSelectedItem('sia');
            }

            if (this.$state.current.name === 'home.sia') {
                this.selectedItem = "sia";
            } else if (this.$state.current.name === 'home.detector') {
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

                if (this.$state.current.name !== 'home.sia') {
                    this.$state.go('home.sia');
                }
            }
            else {
                this.selectedItem = name;
                if ((this.$state.current.name !== 'home.detector') || (this.$state.current.name === 'home.detector' && this.$state.params['detectorName'] !== name)) {
                    this.$state.go('home.detector', { detectorName: name });
                }
            }

            var sidenav = this.$mdSidenav('left');
            if (sidenav.isOpen()) {
                sidenav.close();
            }
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
                self.properties.push(new NameValuePair("Stamp Name", self.site.stampName));
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
}