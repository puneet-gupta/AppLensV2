///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetectorsService {
        getDetectors(site: Site): ng.IPromise<DetectorDefinition[]>;
        getDetectors(resource: Resource): ng.IPromise<DetectorDefinition[]>;
        getDetectorResponse(resource: Resource, detectorName: string, startTime: string, endTime: string, timeGrain: string): ng.IPromise<DetectorResponse>;
        getDetectorWiki(detectorName: string): ng.IPromise<string>;
        getDetectorSolution(detectorName: string): ng.IPromise<string>;
    }

    export interface ICache<T> {
        [K: string]: T;
    }

    export class DetectorsService implements IDetectorsService {

        private detectorsResponseCache: ICache<DetectorResponse>;
        private detectorsWikiCache: ICache<string>;
        private detectorsSolutionCache: ICache<string>;
        private detectorsListCache: ICache<DetectorDefinition[]>;

        static $inject = ['$q', '$http'];

        constructor(private $q: ng.IQService, private $http: ng.IHttpService) {
            this.detectorsResponseCache = {};
            this.detectorsWikiCache = {};
            this.detectorsSolutionCache = {};
            this.detectorsListCache = {};
        }

        getDetectors(resource: Resource): ng.IPromise<DetectorDefinition[]> {

            var detectors: DetectorDefinition[] = [];
            var deferred = this.$q.defer<DetectorDefinition[]>();

            if (angular.isDefined(this.detectorsListCache["detectorList"])) {
                deferred.resolve(this.detectorsListCache["detectorList"]);
                return deferred.promise;
            }

            var self = this;

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.ListDetectorsPath(resource)
                }
            })
                .success((data: any) => {

                    if (angular.isDefined(data.Value)) {

                        _.each(data.Value, function (item: any) {

                            if (angular.isDefined(item.Properties)) {

                                var detector = new DetectorDefinition(
                                    item.Properties.Name,
                                    item.Properties.DisplayName,
                                    item.Properties.Description,
                                    item.Properties.Rank,
                                    item.Properties.IsEnabled, -1);

                                detectors.push(detector);
                            }
                        });

                        self.detectorsListCache["detectorList"] = detectors;
                        deferred.resolve(detectors);
                    }
                    else {
                        deferred.reject(new ErrorModel(0, "Value field not present in Get Detectors Api response"));
                    }
                })
                .error((err: any) => {
                    deferred.reject(ErrorModelBuilder.Build(err));
                });

            return deferred.promise;
        }

        getDetectorResponse(resource: Resource, detectorName: string, startTime: string, endTime: string, timeGrain: string): ng.IPromise<DetectorResponse> {

            var deferred = this.$q.defer<DetectorResponse>();

            if (angular.isDefined(this.detectorsResponseCache[detectorName])) {
                deferred.resolve(this.detectorsResponseCache[detectorName]);
                return deferred.promise;
            }

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.DetectorResourcePath(resource, detectorName, startTime, endTime, timeGrain)
                }
            })
                .success((data: any) => {

                    var response = new DetectorResponse(startTime, endTime, [], [], null);

                    if (angular.isDefined(data.Properties)) {
                        response = data.Properties;
                        deferred.resolve(response);
                        this.detectorsResponseCache[detectorName] = response;
                    }
                    else {
                        deferred.reject(new ErrorModel(0, "Properties field not present in Get Detector Data Api response"));
                    }

                })
                .error((err: any) => {
                    deferred.reject(ErrorModelBuilder.Build(err));
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
                        deferred.reject(new ErrorModel(0, ''));
                    }
                })
                .error((err: any) => {
                    deferred.reject(ErrorModelBuilder.Build(err));
                });

            return deferred.promise;
        }
    }
}