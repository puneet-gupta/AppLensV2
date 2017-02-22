///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISiaService {
        appAnalysisResponse: SiaResponse;
        perfAnalysisResponse: SiaResponse;
        //getTopLevelResponse(): SiaResponse;
        selectedAbnormalTimePeriod: any;
        getAppAnalysisResponse(): ng.IPromise<any>;
        getPerfAnalysisResponse(): ng.IPromise<any>;
        selectAppDowntime(index: number): void
        selectPerfDowntime(index: number): void;
        PrepareDetectorViewParams(siaResponse: SiaResponse): ICache<DetectorViewParams>
    }

    export class SiaService implements ISiaService {
        private appAnalysisPromise: ng.IPromise<any>;
        private perfAnalysisPromise: ng.IPromise<any>;

        public static $inject: string[] = ["SiteService", "DetectorsService", "TimeParamsService", "$http", "$window"];
        public appAnalysisResponse: SiaResponse;
        public perfAnalysisResponse: SiaResponse;
        public selectedAbnormalTimePeriod: any;

        constructor(private SiteService: ISiteService, private DetectorsService: IDetectorsService, private TimeParamsService: ITimeParamsService, private $http: ng.IHttpService, private $window: angular.IWindowService) {
            this.selectedAbnormalTimePeriod = {};
        }

        getAppAnalysisResponse(): ng.IPromise<any> {

            if (angular.isDefined(this.appAnalysisPromise)) {
                return this.appAnalysisPromise;
            }

            this.appAnalysisPromise = this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.AppAnalysisPath(this.SiteService.site, this.TimeParamsService.StartTime, this.TimeParamsService.EndTime, this.TimeParamsService.TimeGrain)
                }
            })
                .success((data: any) => {

                    this.appAnalysisResponse = new SiaResponse('', '', [], [], []);
                    if (angular.isDefined(data.Properties)) {
                        this.appAnalysisResponse = data.Properties;
                        this.selectedAbnormalTimePeriod.index = this.appAnalysisResponse.AbnormalTimePeriods.length - 1;
                        this.selectedAbnormalTimePeriod.data = this.appAnalysisResponse.AbnormalTimePeriods[this.selectedAbnormalTimePeriod.index];
                    }
                })
                .error((data: any) => {
                    // TODO: Handle Error
                });

            return this.appAnalysisPromise;
        }

        getPerfAnalysisResponse(): ng.IPromise<any> {

            if (angular.isDefined(this.perfAnalysisPromise)) {
                return this.perfAnalysisPromise;
            }

            this.perfAnalysisPromise = this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.PerfAnalysisPath(this.SiteService.site, this.TimeParamsService.StartTime, this.TimeParamsService.EndTime, this.TimeParamsService.TimeGrain)
                }
            })
                .success((data: any) => {

                    this.perfAnalysisResponse = new SiaResponse('', '', [], [], []);
                    if (angular.isDefined(data.Properties)) {
                        this.perfAnalysisResponse = data.Properties;
                        this.selectedAbnormalTimePeriod.index = 0;// this.perfAnalysisResponse.AbnormalTimePeriods.length - 1;
                        this.selectedAbnormalTimePeriod.data = this.perfAnalysisResponse.AbnormalTimePeriods[this.selectedAbnormalTimePeriod.index];
                    }
                })
                .error((data: any) => {
                    // TODO: Handle Error
                });

            return this.perfAnalysisPromise;
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
            if (index < this.appAnalysisResponse.AbnormalTimePeriods.length && index >= 0) {
                this.selectedAbnormalTimePeriod.index = index;
                this.selectedAbnormalTimePeriod.data = this.appAnalysisResponse.AbnormalTimePeriods[index]
            }
        }

        public selectPerfDowntime(index: number): void {
            if (index < this.perfAnalysisResponse.AbnormalTimePeriods.length && index >= 0) {
                this.selectedAbnormalTimePeriod.index = index;
                this.selectedAbnormalTimePeriod.data = this.perfAnalysisResponse.AbnormalTimePeriods[index]
            }
        }
    }


}