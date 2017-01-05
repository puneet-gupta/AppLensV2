module SupportCenter {
    export class MultipleSitesCtrl {
        public static $inject: string[] = ["SiteService", "$mdPanel", "$window", "$stateParams"];

        constructor(private SiteService: ISiteService, private $mdPanel: angular.material.IPanelService, private $window: ng.IWindowService, private $stateParams: IStateParams) {
            var self = this;
            this.logo = "app/assets/images/Azure-WebApps-Logo.png";
            this.SiteService.promise.then(function (data: any) {
                self.sites = self.SiteService.sites;
            });
        }

        chooseSite(sitename: string): void {
            let locationService = this.$window.location;
            var appLensUrl = locationService.href;
            var oldValue = this.$stateParams.siteName;
            var newValue = sitename;
            appLensUrl = appLensUrl.replace(oldValue, newValue);
            if (this.sites[0].name != sitename) {
                this.$window.open(appLensUrl);
            } else {
                locationService.replace(appLensUrl);
            }            
        }

        sites: Array<Site>;
        logo: string;
    }
}