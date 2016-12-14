///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISiaService {
        siaResponse: SiaResponse;
        selectedAbnormalTimePeriod: any;
        getAppAnalysisResponse(site: Site, startTime: string, endTime: string, timeGrain: string): ng.IPromise<any>;
        selectDowntime(index: number): void;
    }

    export class SiaService implements ISiaService {
        private siaPromise: ng.IPromise<any>;

        public static $inject: string[] = ["DetectorsService", "SiteService", "$stateParams", "$window", "$http"];
        public siaResponse: SiaResponse;
        public selectedAbnormalTimePeriod: any;

        constructor(private DetectorsService: IDetectorsService, private SiteService: ISiteService, private $stateParams: IStateParams, private $window: angular.IWindowService, private $http: ng.IHttpService) {
            this.selectedAbnormalTimePeriod = {};
        }

        getAppAnalysisResponse(site: Site, startTime: string, endTime: string, timeGrain: string): ng.IPromise<any> {

            if (angular.isDefined(this.siaPromise)) {
                return this.siaPromise;
            }

            this.siaPromise = this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.AppAnalysisPath(site, startTime, endTime, timeGrain)
                }
            })
                .success((data: any) => {

                    this.siaResponse = new SiaResponse('', '', [], [], []);
                    if (angular.isDefined(data.Properties)) {
                        this.siaResponse = data.Properties;
                        this.selectedAbnormalTimePeriod.index = 0;
                        this.selectedAbnormalTimePeriod.data = this.siaResponse.AbnormalTimePeriods[this.selectedAbnormalTimePeriod.index];
                    }
                })
                .error((data: any) => {
                    // TODO: Handle Error
                });

            return this.siaPromise;
        }

        public selectDowntime(index: number): void {
            if (index < this.siaResponse.AbnormalTimePeriods.length && index >= 0) {
                this.selectedAbnormalTimePeriod.index = index;
                this.selectedAbnormalTimePeriod.data = this.siaResponse.AbnormalTimePeriods[index]
            }
        }
    }


}