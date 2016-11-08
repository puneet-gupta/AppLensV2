///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SiaCtrl {

        public static $inject: string[] = ["DetectorsService", "$stateParams", "SiteService", "$window"];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private SiteService: ISiteService, private $window: angular.IWindowService) {

            var self = this;
            this.DetectorData = {};
            if (!angular.isDefined(this.$stateParams.startTime)) {
                this.$stateParams.startTime = '';
            }

            if (!angular.isDefined(this.$stateParams.endTime)) {
                this.$stateParams.endTime = '';
            }

            if (!angular.isDefined(this.$stateParams.timeGrain)) {
                this.$stateParams.timeGrain = '';
            }

            this.isLoading = true;

            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                self.DetectorsService.getAppAnalysisResponse(self.site, self.$stateParams.startTime, self.$stateParams.endTime, self.$stateParams.timeGrain).then(function (data: SiaResponse) {
                    self.SiaResponse = data;
                    self.isLoading = false;
                    self.PrepareDetectorViewParams(self.SiaResponse.StartTime, self.SiaResponse.EndTime);
                });
            });
        }

        private PrepareDetectorViewParams(startTime: string, endTime: string): void {

            var detectorViewHelper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            if (!angular.isDefined(this.SiaResponse.Payload)) {
                return;
            }

            for (let detectorAnalysisData of this.SiaResponse.Payload) {
                //console.log(new Date().getTime() + ": Starting for " + detectorAnalysisData.Source);
                this.DetectorData[detectorAnalysisData.Source] = new DetectorViewParams();
                this.DetectorData[detectorAnalysisData.Source].loading = false;
                this.DetectorData[detectorAnalysisData.Source].chartoptions = detectorViewHelper.GetChartOptions(detectorAnalysisData.Source);
                this.DetectorData[detectorAnalysisData.Source].chartdata = detectorViewHelper.GetChartData(startTime, endTime, detectorAnalysisData.Metrics, detectorAnalysisData.Source);

                this.DetectorData[detectorAnalysisData.Source].chartoptions.chart.height = 
                    this.DetectorData[detectorAnalysisData.Source].chartoptions.chart.height + (this.DetectorData[detectorAnalysisData.Source].chartdata.length / 8) * 20;
                this.DetectorData[detectorAnalysisData.Source].chartoptions.chart.margin.top = 20 + (this.DetectorData[detectorAnalysisData.Source].chartdata.length / 8) * 20;

                var self = this;

                this.DetectorsService.getDetectors(this.site).then(function (data: DetectorDefinition[]) {
                    self.DetectorData[detectorAnalysisData.Source].info = _.find(data, function (item: DetectorDefinition) {
                        return item.Name.toLowerCase() === detectorAnalysisData.Source.toLowerCase();
                    });
                });

                this.DetectorsService.getDetectorWiki(detectorAnalysisData.Source).then(function (wikiResponse) {
                    self.DetectorData[detectorAnalysisData.Source].wiki = wikiResponse;
                });

                this.DetectorsService.getDetectorSolution(detectorAnalysisData.Source).then(function (solutionResponse) {
                    self.DetectorData[detectorAnalysisData.Source].solution = solutionResponse;
                });
                //console.log(new Date().getTime() + ": Ending for " + detectorAnalysisData.Source);
            }
        }

        public SiaResponse: SiaResponse;
        private site: Site;
        public DetectorData: ICache<DetectorViewParams>;
        public isLoading: boolean;
    }
}