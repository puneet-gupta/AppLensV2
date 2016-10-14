///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class SiaCtrl {

        public static $inject: string[] = ["DetectorsService", "$stateParams", "SiteService"];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private SiteService: ISiteService) {

            var self = this;

            if (!angular.isDefined(this.$stateParams.startTime)) {
                this.$stateParams.startTime = '';
            }

            if (!angular.isDefined(this.$stateParams.endTime)) {
                this.$stateParams.endTime = '';
            }

            if (!angular.isDefined(this.$stateParams.timeGrain)) {
                this.$stateParams.timeGrain = '';
            }

            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;

                self.DetectorsService.getAppAnalysisResponse(self.site, self.$stateParams.startTime, self.$stateParams.endTime, self.$stateParams.timeGrain).then(function (data: SiaResponse) {
                    self.SiaResponse = data;
                });
            });
        }

        public SiaResponse: SiaResponse;
        private site: Site;

    }
}