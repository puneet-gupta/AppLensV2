///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISiaService {
        selectedAbnormalTimePeriod: any;
        getSiaResponse(): ng.IPromise<IAnalysisResult>;
        getAppAnalysisResponse(): ng.IPromise<IAnalysisResult>;
        getPerfAnalysisResponse(): ng.IPromise<IAnalysisResult>;
        selectAppDowntime(index: number): void
        PrepareDetectorViewParams(siaResponse: SiaResponse): ICache<DetectorViewParams>
    }

    export class SiaService implements ISiaService {
        private appAnalysisPromise: ng.IPromise<any>;
        private perfAnalysisPromise: ng.IPromise<any>;

        private analysisCache: ICache<IAnalysisResult>;
        private analysisPromiseCache: ICache<ng.IPromise<any>>;
        private analysisResultCache: ICache<SiaResponse>;

        public static $inject: string[] = ["SiteService", "DetectorsService", "TimeParamsService", "$http", "$q", "$window", "$state", "$stateParams"];
        public selectedAbnormalTimePeriod: any;

        constructor(private SiteService: ISiteService, private DetectorsService: IDetectorsService, private TimeParamsService: ITimeParamsService, private $http: ng.IHttpService, private $q: ng.IQService, private $window: angular.IWindowService, private $state: angular.ui.IStateService, private $stateParams: IStateParams) {
            this.selectedAbnormalTimePeriod = {};
            this.analysisPromiseCache = {};
            this.analysisResultCache = {};
            this.analysisCache = {};
            this.analysisCache['appAnalysis'] = { Promise: null, Response: null, SelectedAbnormalTimePeriod: null };
            this.analysisCache['perfAnalysis'] = { Promise: null, Response: null, SelectedAbnormalTimePeriod: null };
            this.selectedAbnormalTimePeriod.index = 0
        }

        getSiaResponse(): ng.IPromise<IAnalysisResult> {
            return this.$stateParams.analysisType === 'perfAnalysis' ? this.getPerfAnalysisResponse() : this.getAppAnalysisResponse();
        }

        getAppAnalysisResponse(): ng.IPromise<IAnalysisResult> {
            var self = this;
            var deferred = this.$q.defer<IAnalysisResult>();

            var analysisType = 'appAnalysis';
            if (angular.isDefined(this.analysisCache[analysisType].Promise) && this.analysisCache[analysisType].Promise !== null) {
                this.analysisCache[analysisType].Promise.then(function (data: any) {
                    deferred.resolve(self.analysisCache[analysisType])
                });
                return deferred.promise;
            }

            this.analysisCache[analysisType].Promise = this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.AppAnalysisPath(this.SiteService.site, this.TimeParamsService.StartTime, this.TimeParamsService.EndTime, this.TimeParamsService.TimeGrain)
                }
            })
                .success((data: any) => {

                    
                    if (angular.isDefined(data.Properties)) {
                        this.analysisCache[analysisType].Response = data.Properties;
                        this.analysisCache[analysisType].SelectedAbnormalTimePeriod = {};
                        this.analysisCache[analysisType].SelectedAbnormalTimePeriod.index = this.analysisCache[analysisType].Response.AbnormalTimePeriods.length - 1;
                        this.analysisCache[analysisType].SelectedAbnormalTimePeriod.data = this.analysisCache[analysisType].Response.AbnormalTimePeriods[this.selectedAbnormalTimePeriod.index];

                        deferred.resolve(this.analysisCache[analysisType]);
                    }
                    else {
                        deferred.reject(new ErrorModel(0, "Invalid Data from appanalysis API"));
                    }
                })
                .error((data: any) => {
                    deferred.reject(new ErrorModel(0, "Error calling appanalysis API"));
                });

            return deferred.promise;
        }

        getPerfAnalysisResponse(): ng.IPromise<IAnalysisResult> {
            var self = this;
            var deferred = this.$q.defer<IAnalysisResult>();

            var analysisType = 'perfAnalysis';
            if (angular.isDefined(this.analysisCache[analysisType].Promise) && this.analysisCache[analysisType].Promise !== null) {
                this.analysisCache[analysisType].Promise.then(function (data: any) {
                    deferred.resolve(self.analysisCache[analysisType])
                });
                return deferred.promise;
            }

            this.analysisCache[analysisType].Promise = this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.PerfAnalysisPath(this.SiteService.site, this.TimeParamsService.StartTime, this.TimeParamsService.EndTime, this.TimeParamsService.TimeGrain)
                }
            })
                .success((data: any) => {

                    if (angular.isDefined(data.Properties)) {
                        this.analysisCache[analysisType].Response = data.Properties;
                        this.analysisCache[analysisType].SelectedAbnormalTimePeriod = {};
                        this.analysisCache[analysisType].SelectedAbnormalTimePeriod.index = this.analysisCache[analysisType].Response.AbnormalTimePeriods.length - 1;
                        this.analysisCache[analysisType].SelectedAbnormalTimePeriod.data = this.analysisCache[analysisType].Response.AbnormalTimePeriods[this.selectedAbnormalTimePeriod.index];

                        deferred.resolve(this.analysisCache[analysisType]);
                    }
                    else {
                        deferred.reject(new ErrorModel(0, "Invalid Data from perfanalysis API"));
                    }
                })
                .error((data: any) => {
                    deferred.reject(new ErrorModel(0, "Error in call to perfanalysis API"));
                });

            return deferred.promise;
        }

        public PrepareDetectorViewParams(siaResponse: SiaResponse): ICache<DetectorViewParams> {

            var detectorViewHelper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            if (!angular.isDefined(siaResponse.Payload)) {
                return;
            }

            let DetectorData: ICache<DetectorViewParams> = {};

            for (let detectorAnalysisData of siaResponse.Payload) {
                
                DetectorData[detectorAnalysisData.Source] = new DetectorViewParams();
                DetectorData[detectorAnalysisData.Source].loading = false;
                DetectorData[detectorAnalysisData.Source].chartoptions = detectorViewHelper.GetChartOptions(detectorAnalysisData.Source);
                DetectorData[detectorAnalysisData.Source].chartdata = detectorViewHelper.GetChartData(siaResponse.StartTime, siaResponse.EndTime, detectorAnalysisData.Metrics, detectorAnalysisData.Source);

                DetectorData[detectorAnalysisData.Source].chartoptions.chart.height =
                    DetectorData[detectorAnalysisData.Source].chartoptions.chart.height + (DetectorData[detectorAnalysisData.Source].chartdata.length / 8) * 20;
                DetectorData[detectorAnalysisData.Source].chartoptions.chart.margin.top = 20 + (DetectorData[detectorAnalysisData.Source].chartdata.length / 8) * 20;

                DetectorData[detectorAnalysisData.Source].responsemetadata = detectorAnalysisData.DetectorMetaData;
                DetectorData[detectorAnalysisData.Source].info = detectorAnalysisData.DetectorDefinition;
                DetectorData[detectorAnalysisData.Source].metricsets = detectorAnalysisData.Metrics;
                DetectorData[detectorAnalysisData.Source].additionalData = detectorAnalysisData.Data;

                siaResponse.AbnormalTimePeriods.forEach(x => {
                    x.Visible = false;
                    x.Events.forEach(detector => {
                        detector.Visible = false
                        if (detector.Source === 'cpuanalysis') {
                            detector.Instance = detector.Message.split('\'')[1];
                        }
                    });
                    x.Events
                });

                var self = this;

                this.DetectorsService.getDetectorWiki(detectorAnalysisData.Source).then(function (wikiResponse) {
                    DetectorData[detectorAnalysisData.Source].wiki = wikiResponse;
                });

                this.DetectorsService.getDetectorSolution(detectorAnalysisData.Source).then(function (solutionResponse) {
                    DetectorData[detectorAnalysisData.Source].solution = solutionResponse;
                });                
            }

            return DetectorData;
        }

        public selectAppDowntime(index: number): void {
            if (index < this.analysisCache[this.$stateParams.analysisType].Response.AbnormalTimePeriods.length && index >= 0) {
                this.selectedAbnormalTimePeriod.index = index;
                this.selectedAbnormalTimePeriod.data = this.analysisCache[this.$stateParams.analysisType].Response.AbnormalTimePeriods[index]
            }
        }
    }

    export interface IAnalysisResult {
        Promise: ng.IPromise<IAnalysisResult>;
        Response: SiaResponse;
        SelectedAbnormalTimePeriod: any;
    }
}