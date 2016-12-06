///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISiteService {
        promise: ng.IPromise<any>;
        site: Site;
    }

    export class SiteService implements ISiteService {

        static $inject = ['$http', '$stateParams'];
        constructor(private $http: ng.IHttpService, private $stateParams: IStateParams) {
            let siteName = $stateParams.siteName;
            var self = this;
            this.promise = this.$http.get("/api/sites/" + siteName).success(function (data: any) {

                var hostNameList: string[] = [];
                for (let hostname of data.HostNames) {
                    if (hostname.SiteType === 0)    // non scm hostname
                    {
                        hostNameList.push(hostname.Name)
                    }
                }

                self.site = new Site(data.Details.SiteName, data.Details.SubscriptionName, "internal_rg", hostNameList, data.Stamp.Name, data.Details.Kind);
                self.site.sku = data.Details.SKU;
            });


            // Fetch Diagnostic Properties of the site.
            this.promise.then(function (data: any) {

                self.$http({
                    method: "GET",
                    url: UriPaths.DiagnosticsPassThroughAPIPath(),
                    headers: {
                        'GeoRegionApiRoute': UriPaths.SiteDiagnosticPropertiesPath(self.site)
                    }
                })
                    .success((data: any) => {

                        if (angular.isDefined(data.Properties)) {

                            self.site.stack = data.Properties.Stack;
                            self.site.kind = data.Properties.Kind === 'app' ? 'webapp' : data.Properties.Kind;
                            self.site.isLinux = data.Properties.IsLinux;
                            self.site.numberOfSlots = data.Properties.NumberOfSlots;
                            self.site.numberOfContinousWebJobs = data.Properties.ContinousWebJobsCount;
                            self.site.numberOfTriggeredWebJobs = data.Properties.TriggeredWebJobsCount;
                        }
                    });
            });
        }
        
        public promise: ng.IPromise<any>;
        public site: Site;
    }
}