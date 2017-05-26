module SupportCenter {
    export class AseAvailabilityAnalysisResponse implements IAnalysisResponse {
        public static $inject: string[] = ["$stateParams", "$http", "TimeParamsService", "AseService", "$q"]

        constructor(private $stateParams: IStateParams, private $http: ng.IHttpService, private TimeParamsService: ITimeParamsService, private AseService: IResourceService, private $q: ng.IQService) {
        }

        getAnalysisResponse(): ng.IPromise<IAnalysisResult> {
            var self = this;
            var deferred = this.$q.defer<IAnalysisResult>();

            let analysis = { Promise: null, Response: null, SelectedAbnormalTimePeriod: null };
            analysis.Promise = this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.AseAvailabilityAnalysisPath(this.AseService.resource, this.TimeParamsService.StartTime, this.TimeParamsService.EndTime, this.TimeParamsService.TimeGrain),
                    'IsInternal': this.TimeParamsService.IsInternal
                }
            }).success((data: any) => {


                if (angular.isDefined(data.Properties)) {
                    analysis.Response = data.Properties;
                    analysis.SelectedAbnormalTimePeriod = {};
                    analysis.SelectedAbnormalTimePeriod.index = analysis.Response.AbnormalTimePeriods.length - 1;
                    analysis.SelectedAbnormalTimePeriod.data = analysis.Response.AbnormalTimePeriods[analysis.SelectedAbnormalTimePeriod.index];

                    deferred.resolve(analysis);
                }
                else {
                    deferred.reject(new ErrorModel(0, "Invalid Data from aseAvailabilityAnalysis API"));
                }
            })
                .error((data: any) => {
                    deferred.reject(new ErrorModel(0, "Error in call to aseAvailabilityAnalysis API"));
                });

            return deferred.promise;
        }
    }
}