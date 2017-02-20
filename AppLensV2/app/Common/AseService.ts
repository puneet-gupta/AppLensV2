///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IResourceService {
        promise: ng.IPromise<any>;
        site: Site;
        hostingEnvironment: HostingEnvironment;
        resource: Resource;
        sites: Array<Site>;
    }

    export class AseService implements IResourceService {

        static $inject = ['$http', '$stateParams', 'ErrorHandlerService'];
        constructor(private $http: ng.IHttpService, private $stateParams: IStateParams, private ErrorHandlerService: IErrorHandlerService) {
            var self = this;

            this.promise = this.$http.get(UriPaths.AppServiceEnvironmentDetails(this.$stateParams))
                .success(function (data: any) {
                    self.resource = new HostingEnvironment(data.Details.Subscription, data.Details.ResourceGroupName, data.Details.StampName, data.Details.InternalStampName);
                })
                .error(function (err: any) {
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
        }
        
        public promise: ng.IPromise<any>;
        public site: Site;
        public hostingEnvironment: HostingEnvironment;
        public resource: Resource;
        public sites: Site[];
    }
}