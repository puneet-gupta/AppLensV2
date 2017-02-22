///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class PerfCtrl {

        public static $inject: string[] = ["SiaService", "SiteService", "$window", "ErrorHandlerService"];

        constructor(private SiaService: ISiaService, private SiteService: ISiteService, private $window: angular.IWindowService, private ErrorHandlerService: IErrorHandlerService) {

            var self = this;
            this.DetectorData = {};

            this.isLoading = true;

            this.SiteService.promise.then(function (data: any) {

                self.SiaService.getPerfAnalysisResponse().then(function (data: SiaResponse) {
                    self.SiaResponse = SiaService.perfAnalysisResponse;
                    self.selectedAbnormalTimePeriod = SiaService.selectedAbnormalTimePeriod;
                    self.DetectorData = self.SiaService.PrepareDetectorViewParams(self.SiaResponse);
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
                this.SiaService.selectPerfDowntime(index);
            }
        }

        public SiaResponse: SiaResponse;
        public DetectorData: ICache<DetectorViewParams>;
        public isLoading: boolean;
        public selectedAbnormalTimePeriod: any;
    }
}