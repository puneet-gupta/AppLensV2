///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class DetectorCtrl {

        public static $inject: string[] = ["DetectorsService", "$stateParams", "SiteService", "$window"];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private SiteService: ISiteService, private $window: angular.IWindowService) {

            var self = this;
            this.detectorName = this.$stateParams.detectorName.toLowerCase();

            this.detectorInfo = _.find(this.DetectorsService.detectorList, function (item) {
                return item.name.toLowerCase() === self.detectorName;
            });

            if (!angular.isDefined(this.$stateParams.startTime)) {
                this.$stateParams.startTime = '';
            }

            if (!angular.isDefined(this.$stateParams.endTime)) {
                this.$stateParams.endTime = '';
            }

            this.chartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.chartOptions = helper.GetChartOptions();

            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                self.DetectorsService.getDetectorResponse(self.site, self.detectorName, self.$stateParams.startTime, self.$stateParams.endTime).then(function (data: DetectorResponse) {
                    self.detectorResponse = data;
                    self.chartData = helper.GetChartData(data, self.detectorName);
                    self.dataLoading = false;
                });
            });
        }

        public detectorResponse: DetectorResponse;
        private detectorName: string;
        private site: Site;
        chartOptions: any;
        chartData: any;
        dataLoading: Boolean = true;
        detectorInfo: Detector;
    }
}