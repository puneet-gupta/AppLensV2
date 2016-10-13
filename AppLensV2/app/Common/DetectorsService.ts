///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetectorsService {
        getDetectorList(): ng.IPromise<Detector[]>;
        detectorList: Detector[];
        getDetectorResponse(site: Site, detectorName: string, startTime: string, endTime: string, timeGrain: string): ng.IPromise<DetectorResponse>;
        getAppAnalysisResponse(site: Site, startTime: string, endTime: string, timeGrain: string): ng.IPromise<SiaResponse>;
        getDetectorWiki(detectorName: string): ng.IPromise<string>;
        getDetectorSolution(detectorName: string): ng.IPromise<string>;
    }

    export interface ICache<T> {
        [K: string]: T;
    }

    export class DetectorsService implements IDetectorsService {

        private detectorsResponseCache: ICache<DetectorResponse>;
        private siaResponseCache: ICache<SiaResponse>;
        private detectorsWikiCache: ICache<string>;
        private detectorsSolutionCache: ICache<string>;

        static $inject = ['$q', '$http'];

        constructor(private $q: ng.IQService, private $http: ng.IHttpService) {
            this.detectorsResponseCache = {};
            this.siaResponseCache = {};
            this.detectorsWikiCache = {};
            this.detectorsSolutionCache = {};
        }

        getDetectorList(): ng.IPromise<Detector[]> {
            return this.$q.when(this.detectorList);
        }

        getDetectorResponse(site: Site, detectorName: string, startTime: string, endTime: string, timeGrain: string): ng.IPromise<DetectorResponse> {

            var deferred = this.$q.defer<DetectorResponse>();

            if (angular.isDefined(this.detectorsResponseCache[detectorName])) {
                deferred.resolve(this.detectorsResponseCache[detectorName]);
                return deferred.promise;
            }

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.DetectorResourcePath(site, detectorName, startTime, endTime, timeGrain)
                }
            })
                .success((data: any) => {

                    var response = new DetectorResponse(startTime, endTime, [], []);

                    if (angular.isDefined(data.Properties)) {
                        response = data.Properties;
                        deferred.resolve(response);
                        this.detectorsResponseCache[detectorName] = response;
                    }
                    else {
                        deferred.reject("Properties not present in api response");
                    }

                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        getAppAnalysisResponse(site: Site, startTime: string, endTime: string, timeGrain: string): ng.IPromise<SiaResponse> {

            var deferred = this.$q.defer<SiaResponse>();

            if (angular.isDefined(this.siaResponseCache["sia"])) {
                deferred.resolve(this.siaResponseCache["sia"]);
                return deferred.promise;
            }

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.AppAnalysisPath(site, startTime, endTime, timeGrain)
                }
            })
                .success((data: any) => {

                    var response = new SiaResponse('', '', [], []);
                    if (angular.isDefined(data.Properties)) {
                        response = data.Properties;
                        this.siaResponseCache["sia"] = response;
                        deferred.resolve(response);
                    }
                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        getDetectorWiki(detectorName: string): ng.IPromise<string> {
            return this.getDetectorDocument(detectorName, "wiki.md");
        }

        getDetectorSolution(detectorName: string): ng.IPromise<string> {
            return this.getDetectorDocument(detectorName, "solution.md");
        }

        private getDetectorDocument(detectorName: string, documentName: string): ng.IPromise<string> {

            var cacheObject = undefined;
            var deferred = this.$q.defer<string>();
            
            switch (documentName.toLocaleLowerCase()) {
                case "solution.md":
                    cacheObject = this.detectorsSolutionCache;
                    break;
                case "wiki.md":
                    cacheObject = this.detectorsWikiCache;
                    break;
            }
            
            if (angular.isDefined(cacheObject) && angular.isDefined(cacheObject[detectorName])) {
                deferred.resolve(cacheObject[detectorName]);
                return deferred.promise;
            }
            
            this.$http({
                method: "GET",
                url: UriPaths.DetectorsDocumentApiPath(detectorName, documentName)
            })
                .success((data: string) => {
                    if (angular.isDefined(data) && data !== '') {

                        if (angular.isDefined(cacheObject)) {
                            cacheObject[detectorName] = data;
                        }

                        deferred.resolve(data);
                    }
                    else {
                        deferred.reject(data);
                    }
                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        // TODO: When we have a geo-region API to get all detectors, this section will be replaced by the API call
        // Issue : https://github.com/ShekharGupta1988/AppLensV2/issues/3
        public detectorList: Detector[] = [
            {
                name: "servicehealth",
                displayName: 'Antares LSIs',
                description: ''
            },
            {
                name: "cpuanalysis",
                displayName: 'CPU Analysis',
                description: ''
            },
            {
                name: "memoryanalysis",
                displayName: 'Memory Analysis',
                description: ''
            },
            {
                name: "siteswap",
                displayName: 'Site Swap Operations',
                description: ''
            },
            {
                name: "storagefailover",
                displayName: 'Storage Volumes Failover',
                description: ''
            },
            {
                name: "siterestartuserinitiated",
                displayName: 'User Initiated Site Restarts',
                description: ''
            },
            {
                name: "siterestartsettingupdate",
                displayName: 'Config Update Site Restarts',
                description: ''
            },
            {
                name: "sitecrashes",
                displayName: 'App Crashes',
                description: ''
            },
            {
                name: "deployment",
                displayName: 'App Deployments',
                description: ''
            }
        ];
    }
}