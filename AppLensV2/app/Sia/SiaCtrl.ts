///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SiaCtrl {

        public static $inject: string[] = ["DetectorsService", "SiaService", "SiteService", "$window", "ErrorHandlerService"];

        constructor(private DetectorsService: IDetectorsService, private SiaService: ISiaService, private SiteService: ISiteService, private $window: angular.IWindowService, private ErrorHandlerService: IErrorHandlerService) {

            var self = this;
            this.DetectorData = {};

            this.isLoading = true;

            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                self.SiaService.getAppAnalysisResponse().then(function (data: SiaResponse) {
                    self.SiaResponse = SiaService.appAnalysisResponse;
                    self.selectedAbnormalTimePeriod = SiaService.selectedAbnormalTimePeriod;
                    self.PrepareDetectorViewParams(self.SiaResponse.StartTime, self.SiaResponse.EndTime);
                    self.isLoading = false;
                }, function (err) {
                    self.isLoading = false;
                    self.ErrorHandlerService.showError(ErrorModelBuilder.Build(err));
                });
            }, function (err) {
                // Error in calling Site Details
                self.isLoading = false;
            });
        }

        public selectDowntime(index: number): void {
            if (index >= 0) {
                this.SiaService.selectDowntime(index);
            }
        }

        private PrepareDetectorViewParams(startTime: string, endTime: string): void {

            var detectorViewHelper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            if (!angular.isDefined(this.SiaResponse.Payload)) {
                return;
            }

            for (let detectorAnalysisData of this.SiaResponse.Payload) {
                var timer = new Date().getTime();
               // console.log( + ": Starting for " + detectorAnalysisData.Source);
                this.DetectorData[detectorAnalysisData.Source] = new DetectorViewParams();
                this.DetectorData[detectorAnalysisData.Source].loading = false;
                this.DetectorData[detectorAnalysisData.Source].chartoptions = detectorViewHelper.GetChartOptions(detectorAnalysisData.Source);
                this.DetectorData[detectorAnalysisData.Source].chartdata = detectorViewHelper.GetChartData(startTime, endTime, detectorAnalysisData.Metrics, detectorAnalysisData.Source);

                this.DetectorData[detectorAnalysisData.Source].chartoptions.chart.height = 
                    this.DetectorData[detectorAnalysisData.Source].chartoptions.chart.height + (this.DetectorData[detectorAnalysisData.Source].chartdata.length / 8) * 20;
                this.DetectorData[detectorAnalysisData.Source].chartoptions.chart.margin.top = 20 + (this.DetectorData[detectorAnalysisData.Source].chartdata.length / 8) * 20;

                this.DetectorData[detectorAnalysisData.Source].responsemetadata = detectorAnalysisData.DetectorMetaData;
                this.DetectorData[detectorAnalysisData.Source].info = detectorAnalysisData.DetectorDefinition;
                this.DetectorData[detectorAnalysisData.Source].metricsets = detectorAnalysisData.Metrics;
                this.DetectorData[detectorAnalysisData.Source].additionalData = detectorAnalysisData.Data;

                this.SiaResponse.AbnormalTimePeriods.forEach(x => {
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
                    self.DetectorData[detectorAnalysisData.Source].wiki = wikiResponse;
                });

                this.DetectorsService.getDetectorSolution(detectorAnalysisData.Source).then(function (solutionResponse) {
                    self.DetectorData[detectorAnalysisData.Source].solution = solutionResponse;
                });
                console.log(detectorAnalysisData.Source + ": " + (new Date().getTime() - timer));
            }
        }

        public SiaResponse: SiaResponse;
        private site: Site;
        public DetectorData: ICache<DetectorViewParams>;
        public isLoading: boolean;
        public selectedAbnormalTimePeriod: any;
    }
}