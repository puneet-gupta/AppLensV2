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

        chooseSite(site: Site): void {
            let locationService = this.$window.location;
            var appLensUrl = locationService.href;
            var oldValue = this.$stateParams.siteName;
            var newValue = site.name;
            appLensUrl = locationService.origin + "/stamps/" + site.internalStampName + locationService.pathname.replace(oldValue, newValue) +
                locationService.search;
            if (this.sites[0].name !== site.name && this.sites[0].internalStampName !== site.internalStampName) {
                this.$window.open(appLensUrl);
            } else {
                locationService.replace(appLensUrl);
            }            
        }

        sites: Array<Site>;
        logo: string;
    }
}