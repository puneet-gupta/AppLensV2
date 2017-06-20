///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISupportCenterService {
        getSessionData(sessionId: string): ng.IPromise<SupportCenterSessionData>;
        getTicketWorflowData(ticketWorkflowId: string): ng.IPromise<SupportCenterTicketWorkflowData>;
        
        dataPromise: ng.IPromise<any>;
        supportCenterWorkflowList: SupportCenterTicketWorkflowData[];
    }

    export class SupportCenterService implements ISupportCenterService {

        private sessionDataCache: ICache<SupportCenterSessionData>;
        private ticketWorkflowDataCache: ICache<SupportCenterTicketWorkflowData>;

        static $inject = ['$http', '$q', '$stateParams'];
        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private $stateParams: IStateParams) {

            this.sessionDataCache = {};
            this.ticketWorkflowDataCache = {};

            var self = this;

            if (!angular.isDefined(this.$stateParams.hostingEnvironmentName) || this.$stateParams.hostingEnvironmentName === '') {

                this.dataPromise = this.$http.get(UriPaths.SupportCenterSessionsListPath(this.$stateParams.siteName))
                    .success(function (data: any) {
                        self.supportCenterWorkflowList = data;
                    });
            }
        }

        public getSessionData(sessionId: string): ng.IPromise<SupportCenterSessionData> {

            var deferred = this.$q.defer<SupportCenterSessionData>();
            let self = this;
            if (angular.isDefined(this.sessionDataCache[sessionId])) {
                deferred.resolve(this.sessionDataCache[sessionId]);
                return deferred.promise;
            }

            this.$http.get(UriPaths.SupportCenterSessionPath(sessionId))
                .success(function (data: any) {
                    self.sessionDataCache[sessionId] = data;
                    deferred.resolve(data);
                })
                .error((err: any) => {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        public getTicketWorflowData(ticketWorkflowId: string): ng.IPromise<SupportCenterTicketWorkflowData> {

            var deferred = this.$q.defer<SupportCenterTicketWorkflowData>();
            let self = this;
            if (angular.isDefined(this.ticketWorkflowDataCache[ticketWorkflowId])) {
                deferred.resolve(this.ticketWorkflowDataCache[ticketWorkflowId]);
                return deferred.promise;
            }

            this.$http.get(UriPaths.SupportCenterTicketWorkflowPath(ticketWorkflowId))
                .success(function (data: any) {
                    self.ticketWorkflowDataCache[ticketWorkflowId] = data;
                    deferred.resolve(data);
                })
                .error((err: any) => {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        public dataPromise: ng.IPromise<any>;
        public supportCenterWorkflowList: SupportCenterTicketWorkflowData[];
    }
}