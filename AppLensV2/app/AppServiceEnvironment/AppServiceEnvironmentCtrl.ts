﻿///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class AppServiceEnvrionmentCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "SiaService", "$mdSidenav", "AseService", "$stateParams", "$state", "$window", "$mdPanel", "FeedbackService", "$mdToast", "ErrorHandlerService", "$mdDialog", "bowser", "ThemeService"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private SiaService: ISiaService, private $mdSidenav: angular.material.ISidenavService, private AseService: IResourceService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private ErrorHandlerService: IErrorHandlerService, private $mdDialog: angular.material.IDialogService, private bowser: any, public ThemeService: IThemeService) {

            if (bowser.msie || bowser.msedge || bowser.firefox) {

                ErrorHandlerService.showError({
                    Message: "Yikes... We have some outstanding browser specific issues which we are fixing. For Better experience, you can use Chrome browser for now"
                });
            }

            this.avaiabilityChartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.availabilityChartOptions = helper.GetChartOptions('runtimeavailability');
            this.containerHeight = this.$window.innerHeight * 0.25 + 'px';

            if (!angular.isDefined(this.$stateParams.stamp) || this.$stateParams.stamp === '') {
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

            this.AseService.promise.then(function (data: any) {
                self.hostingEnvironment = self.AseService.hostingEnvironment;

                self.getRuntimeAvailability();

                self.DetectorsService.getDetectors(self.hostingEnvironment).then(function (data: DetectorDefinition[]) {
                    self.detectors = data;
                    self.detectorListLoaded = true;
                }, function (err) {
                    self.detectorListLoaded = true;
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
            }, function (err) {
                // Error in calling ASE Details

                self.detectorListLoaded = true;
                self.dataLoading = false;
            });

            //if no child route is defined, then set default child route to sia
            if (this.$state.current.name.indexOf('.detector') >= 0) {
                this.selectedItem = this.$state.params['detectorName'];
            }
        }

        detectors: DetectorDefinition[];
        detectorListLoaded: boolean = false;
        selectedItem: string;
        hostingEnvironment: HostingEnvironment;
        availabilityChartOptions: any;
        avaiabilityChartData: any;
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
                if (this.$state.current.name.indexOf('home3') >= 0) {
                    if ((this.$state.current.name !== 'home3.detector') || (this.$state.current.name === 'home3.detector' && this.$state.params['detectorName'] !== name)) {
                        this.$state.go('home3.detector', { detectorName: name });
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

            this.DetectorsService.getDetectorResponse(self.hostingEnvironment, 'asehealth').then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data.StartTime, data.EndTime, data.Metrics, 'asehealth');
                self.dataLoading = false;
                var iterator = 0;
                var requestsIterator = 0;

                _.each(chartDataList, function (item: any) {
                    var f: string;
                    if (item.key.toLowerCase().indexOf("asehealth") !== -1) {
                        item.color = DetectorViewHelper.runtimeAvailabilityColors[iterator];
                        iterator++;
                        self.avaiabilityChartData.push(item);
                    }
                });
            }, function (err) {
                self.dataLoading = false;
                self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
            });
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

        showAseProfile($env): void {

            var position = this.$mdPanel.newPanelPosition()
                .absolute()
                .center();

            var config = {
                attachTo: angular.element(document.body),
                controllerAs: 'aseprofilectrl',
                controller: AseProfileCtrl,
                disableParentScroll: true,
                templateUrl: 'aseprofile.html',
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

    export class AseProfileCtrl {

        constructor(private AseService: IResourceService, public ThemeService: IThemeService) {
            var self = this;
            this.properties = [];

            this.AseService.promise.then(function (data: any) {
                self.hostingEnv = self.AseService.hostingEnvironment;

                self.properties.push(new NameValuePair("Subscription Id", self.hostingEnv.subscriptionId));
                self.properties.push(new NameValuePair("Resource Group", self.hostingEnv.resourceGroup));
                self.properties.push(new NameValuePair("Internal Stamp Name", self.hostingEnv.resourceInternalStamp));
                self.properties.push(new NameValuePair("VNet Name", self.hostingEnv.VNetName));
                self.properties.push(new NameValuePair("VNet Id", self.hostingEnv.VNetId));
                self.properties.push(new NameValuePair("VNet Subnet Name", self.hostingEnv.VNetSubnetName));
                self.properties.push(new NameValuePair("VNet Subnet Address Range", self.hostingEnv.VNetSubnetAddressRange));
                self.properties.push(new NameValuePair("MultiRole Size and Count", self.hostingEnv.MultiRoleSizeAndCount));
                self.properties.push(new NameValuePair("Small Worker Size and Count", self.hostingEnv.SmallWorkerSizeAndCount));
                self.properties.push(new NameValuePair("Medium Worker Size and Count", self.hostingEnv.MediumWorkerSizeAndCount));
                self.properties.push(new NameValuePair("Large Worker Size and Count", self.hostingEnv.LargeWorkerSizeAndCount));
                
            }, function (err) {
            });
        }

        hostingEnv: HostingEnvironment;
        properties: NameValuePair[]
    }
}