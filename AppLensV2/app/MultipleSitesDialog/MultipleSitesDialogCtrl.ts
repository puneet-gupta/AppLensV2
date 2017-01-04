module SupportCenter {
    export class MultipleSitesCtrl {
        public static $inject: string[] = ["$http", "SiteService", "$mdPanel", "$window", "$stateParams"];

        constructor(private $http: ng.IHttpService, private SiteService: ISiteService, private $mdPanel: angular.material.IPanelService, private $window: ng.IWindowService, private $stateParams: IStateParams) {
            var self = this;
            this.logo = "app/assets/images/Azure-WebApps-Logo.png";
            this.SiteService.promise.then(function (data: any) {
                self.sites = self.SiteService.sites;
            });
        }

        chooseSite(sitename: string): void {
            var locationService = this.$window.location;
            console.log(this.$window.location);

            var appLensUrl = locationService.href;
            var oldValue = this.$stateParams.siteName;
            var newValue = sitename;
            appLensUrl = appLensUrl.replace(oldValue, newValue);
            locationService.href = appLensUrl;
        }

        sites: Array<Site>;
        logo: string;
    }
}