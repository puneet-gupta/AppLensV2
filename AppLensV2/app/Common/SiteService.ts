﻿///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISiteService {
        promise: ng.IPromise<any>;
        site: Site;
        sites: Array<Site>;
    }

    export class SiteService implements ISiteService {

        static $inject = ['$http', '$stateParams', 'ErrorHandlerService'];
        constructor(private $http: ng.IHttpService, private $stateParams: IStateParams, private ErrorHandlerService: IErrorHandlerService) {
            let siteName = $stateParams.siteName;
            var self = this;
            this.promise = this.$http.get("/api/sites/" + siteName)
                .success(function (data: any) {

                    self.sites = new Array<Site>();

                    for (let siteDetail of data.Details) {
                        self.sites.push(new Site(siteDetail.SiteName, siteDetail.Subscription, siteDetail.ResourceGroupName, data.HostNames, siteDetail.StampName, siteDetail.InternalStampName));
                    }

                    //if the array is empty then the observer call will fail before it gets to this line with a 404 SiteNotFound
                    self.site = self.sites[0];

                    self.$http({
                        method: "GET",
                        url: UriPaths.DiagnosticsPassThroughAPIPath(),
                        headers: {
                            'GeoRegionApiRoute': UriPaths.SiteDiagnosticPropertiesPath(self.site)
                        }
                    })
                        .success((data: any) => {

                            if (angular.isDefined(data.Properties)) {

                                self.site.stack = data.Properties.AppStack;
                                self.site.kind = data.Properties.Kind === 'app' || data.Properties.Kind === null ? 'webapp' : data.Properties.Kind;
                                self.site.isLinux = data.Properties.IsLinux;
                                self.site.numberOfSlots = data.Properties.NumberOfSlots;
                                self.site.numberOfContinousWebJobs = data.Properties.ContinuousWebJobsCount;
                                self.site.numberOfTriggeredWebJobs = data.Properties.TriggeredWebJobsCount;
                                self.site.sku = data.Properties.Sku;
                            }
                        });
                })
                .error(function (err: any) {
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
        }
        
        public promise: ng.IPromise<any>;
        public site: Site;
        public sites: Site[];
    }
}