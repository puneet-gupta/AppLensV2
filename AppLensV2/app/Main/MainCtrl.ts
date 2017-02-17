///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class MainCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "SiaService", "$mdSidenav", "SiteService", "$stateParams", "$state", "$window", "$mdPanel", "FeedbackService", "$mdToast", "ErrorHandlerService", "$mdDialog", "bowser"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private SiaService: ISiaService, private $mdSidenav: angular.material.ISidenavService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $mdPanel: angular.material.IPanelService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private ErrorHandlerService: IErrorHandlerService, private $mdDialog: angular.material.IDialogService, private bowser: any) {

            if (bowser.msie || bowser.msedge || bowser.firefox) {

                ErrorHandlerService.showError({
                    Message: "Yikes... We have some outstanding browser specific issues which we are fixing. For Better experience, you can use Chrome browser for now"
                });
            }

            if (!angular.isDefined(this.$stateParams.siteName) || this.$stateParams.siteName === '') {
                // TODO: show error or redirect to home page.
            }

            var self = this;
            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                var sitesWithSameHostname = self.SiteService.sites;

                if (sitesWithSameHostname.length > 1) {
                    self.showSitesDialog();
                }

                self.DetectorsService.getDetectors(self.site).then(function (data: DetectorDefinition[]) {
                    self.detectors = self.DetectorsService.detectorsList;
                    self.detectorListLoaded = true;
                });
            }, function (err) {
                // Error in calling Site Details

                self.detectorListLoaded = true;
            });

            // if no child route is defined, then set default child route to sia
            if (this.$state.current.name === 'sites' || this.$state.current.name === 'stampsites' ||
                this.$state.current.name === 'sites.appanalysis' || this.$state.current.name === 'stampsites.appanalysis') {
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

        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        setSelectedItem(name: string): void {
            if (name === 'sia') {
                this.selectedItem = "sia";
                if (this.$state.current.name.indexOf('stampsites') >= 0) {
                    this.$state.go('stampsites.appanalysis.sia');
                } else {
                    this.$state.go('sites.appanalysis.sia');
                }
            }
            else {
                this.selectedItem = name;
                if (this.$state.current.name.indexOf('stampsites') >= 0) {
                    if ((this.$state.current.name !== 'stampsites.appanalysis.detector') || (this.$state.current.name === 'stampsites.appanalysis.detector' && this.$state.params['detectorName'] !== name)) {
                        this.$state.go('stampsites.appanalysis.detector', { detectorName: name });
                    }
                } else {
                    if ((this.$state.current.name !== 'sites.appanalysis.detector') || (this.$state.current.name === 'sites.appanalysis.detector' && this.$state.params['detectorName'] !== name)) {
                        this.$state.go('sites.appanalysis.detector', { detectorName: name });
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