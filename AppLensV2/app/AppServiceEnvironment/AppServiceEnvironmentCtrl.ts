///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class AppServiceEnvrionmentCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "SiaService", "$mdSidenav", "AseService", "$stateParams", "$state", "$window", "$mdPanel", "FeedbackService", "$mdToast", "ErrorHandlerService", "$mdDialog", "bowser"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private SiaService: ISiaService, private $mdSidenav: angular.material.ISidenavService, private AseService: IResourceService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private ErrorHandlerService: IErrorHandlerService, private $mdDialog: angular.material.IDialogService, private bowser: any) {

            if (bowser.msie || bowser.msedge || bowser.firefox) {

                ErrorHandlerService.showError({
                    Message: "Yikes... We have some outstanding browser specific issues which we are fixing. For Better experience, you can use Chrome browser for now"
                });
            }

            this.avaiabilityChartData = [];
            this.requestsChartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.availabilityChartOptions = helper.GetChartOptions('runtimeavailability');
            this.requestsChartOptions = helper.GetChartOptions('runtimeavailability');
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
                self.hostedEnvironment = self.AseService.hostingEnvironment;

                //self.getRuntimeAvailability();

                self.DetectorsService.getDetectors(self.hostedEnvironment).then(function (data: DetectorDefinition[]) {
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

            // if no child route is defined, then set default child route to sia
            if (this.$state.current.name === 'home3') {
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
        hostedEnvironment: HostingEnvironment;
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
}