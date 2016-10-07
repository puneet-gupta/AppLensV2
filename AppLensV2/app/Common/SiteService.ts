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

                self.site = new Site(data.Details[0].SiteName, data.Details[0].SubscriptionName, "internal_rg", hostNameList, data.Stamp.Name);
            });;
        }

        public promise: ng.IPromise<any>;
        public site: Site;
    }
}