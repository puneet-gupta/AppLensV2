///<reference path="../../references.ts" />

module SupportCenter {
    "use strict";
    
    export class AppRestartAnalysisCtrl {

        public static $inject: string[] = ["SiaService", "ThemeService", "$stateParams", "SiteService", "$window", "$state"];

        constructor(private SiaService: ISiaService, private ThemeService: IThemeService, private $stateParams: IStateParams, private SiteService: IResourceService, private $window: angular.IWindowService, public $state: angular.ui.IStateService) {

            this.analysisResult = [];
            this.MetricsPerInstance = {};
            this.MetricsPerInstance['Overall'] = [];
            var self = this;
            var allMetrics: DiagnosticMetricSet[] = [];
            this.selectedWorker = 'Overall';
            
            this.noReason = {
                message: 'The application did not experienced any restarts during this time.',
                type: 0
            };

            let helper = new DetectorViewHelper(this.$window);

            this.chartOptions = helper.GetChartOptions();
            this.chartOptions.chart.height = this.$window.innerHeight * 0.25;
            this.chartOptions.chart.callback = function (chart) {
                chart.dispatch.changeState({ disabled: { 0: true } });
            }

            this.chartData = this.MetricsPerInstance[this.selectedWorker];

            this.isLoading = true;

            this.SiteService.promise.then(function (data) {
                self.SiaService.getSiaResponse().then(function (analysisResult) {
                    let response = analysisResult.Response;
                    if (response.AbnormalTimePeriods && response.AbnormalTimePeriods.length > 0) {
                        self.analysisResult = response.AbnormalTimePeriods[0].Events;
                    }
                    else {

                        self.chartOptions.chart.callback = function (chart) {
                            chart.dispatch.changeState({ disabled: { 0: false } })
                        };

                        let workerprocessrecycle = _.find(response.Payload, function (item) {
                            return item.Source === 'workerprocessrecycle';
                        });

                        if (angular.isDefined(workerprocessrecycle)) {
                            if (workerprocessrecycle.Metrics && workerprocessrecycle.Metrics.length > 0 && workerprocessrecycle.Metrics[0].Values.length > 0) {
                                self.noReason.message = "The application did experienced restarts. However, at this point of time, we couldn't find any reasons for the application restart.";
                                self.noReason.type = 1;
                            }
                        }
                    }

                    response.Payload.forEach(function (item) {
                        allMetrics = allMetrics.concat(item.Metrics);
                    });

                    self.InitializeMetricsPerInstance(allMetrics, response.StartTime, response.EndTime);
                    self.isLoading = false;
                });
            });
        }

        public UpdateChartData() {
            this.chartData = this.MetricsPerInstance[this.selectedWorker];
        }

        public GetHelpulTipName(evidence: NameValuePair[]): string {
            let displayName = _.find(evidence, function (item) { return item.Name === 'displayedName' });
            if (angular.isDefined(displayName)) {
                return displayName.Value;
            }

            return '';
        }

        public OpenHelpulTip(evidence: NameValuePair[]): void {
            let feature = _.find(evidence, function (item) { return item.Name === 'feature' });
            if (angular.isUndefined(feature)) {
                return;
            }

            switch (feature.Value.toLowerCase()) {
                case 'autoheal':
                    this.$window.open('https://blogs.msdn.microsoft.com/waws/2015/11/04/auto-heal-your-azure-web-app/', '_blank');
                    break;

                case 'appanalysis':
                case 'perfanalysis':
                    var nextState = '';
                    if (this.$state.current.name.indexOf('stampsites') >= 0) {
                        nextState = 'stampsites.' + feature.Value.toLowerCase() + '.sia';
                    } else {
                        nextState = 'sites.' + feature.Value.toLowerCase() + '.sia';
                    }

                    var url = this.$state.href(nextState, {}, { absolute: true });
                    this.$window.open(url, '_blank');

                    break;

                case 'memoryanalysis':
                    var memoryUrl = this.$state.href('sites.appanalysis.detector', { detectorName: 'sitememoryanalysis' }, { absolute: true });
                    this.$window.open(memoryUrl, '_blank');
                    break;

                case 'auditlogs':
                    this.$window.open('https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-audit', '_blank');
                    break;

                case 'localcache':
                    this.$window.open('https://docs.microsoft.com/en-us/azure/app-service/app-service-local-cache', '_blank');
                    break;

                case 'trafficmanager':
                    this.$window.open('https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-traffic-manager', '_blank');
                    break;
            }
        }

        private InitializeMetricsPerInstance(metrics: DiagnosticMetricSet[], startTime: string, endTime: string): void {

            let self = this;

            metrics.forEach(function (item) {
                let groupByRoleInstances = _.groupBy(item.Values, function (sample) { return sample.RoleInstance ? sample.RoleInstance.replace('(', '[').replace(')', ']') : 'Overall' });

                _.keys(groupByRoleInstances).forEach(function (item) {
                    if (_.keys(self.MetricsPerInstance).indexOf(item) === -1) {
                        self.MetricsPerInstance[item] = [];
                    }
                });
            });
            
            metrics.forEach(function (item) {
                
                _.keys(self.MetricsPerInstance).forEach(function (instanceItem) {

                    var graphSeries = {
                        key: item.Name,
                        values: []
                    };

                    var metricSamples: DiagnosticMetricSample[] = [];

                    if (instanceItem === 'Overall') {
                        metricSamples = item.Values.filter(function (metricSample) {
                            return metricSample.IsAggregated === true;
                        });
                    }
                    else {
                        metricSamples = item.Values.filter(function (metricSample) {
                            return metricSample.RoleInstance && metricSample.RoleInstance.replace('(', '[').replace(')', ']') === instanceItem;
                        });
                    }

                    graphSeries.values = self.fillValuesInGraphSeries(startTime, endTime, metricSamples);
                    self.MetricsPerInstance[instanceItem].push(graphSeries);
                });
            });
        }

        private fillValuesInGraphSeries(startTimeStr: string, endTimeStr: string, metricSamples: DiagnosticMetricSample[]): any {

            var startTime = new Date(startTimeStr);
            var endTime = new Date(endTimeStr);
            var coeff = 1000 * 60 * 5;
            var roundedStartTime = new Date(Math.round(startTime.getTime() / coeff) * coeff);
            var roundedEndTime = new Date(Math.round(endTime.getTime() / coeff) * coeff);
            var values = [];
            for(var d = new Date(roundedStartTime.getTime()); d < roundedEndTime; d.setTime(d.getTime() + coeff)) {

                let xDate = new Date(d.getTime());
                let yValue = 0;

                let element = _.find(metricSamples, function (item) {
                    return xDate.getTime() === (new Date(item.Timestamp)).getTime();
                });

                if (angular.isDefined(element)) {
                    yValue = element.Total;
                }

                values.push({
                    x: this.ConvertToUTCTime(xDate),
                    y: yValue
                });
            }

            return values;
        }

        private ConvertToUTCTime(localDate: Date): Date {
            var utcTime = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), localDate.getUTCHours(), localDate.getUTCMinutes(), localDate.getUTCSeconds());
            return utcTime;
        }

        public analysisResult: DetectorAbnormalTimePeriod[];
        public MetricsPerInstance: ICache<any>;
        public chartOptions: any;
        public chartData: any;
        public selectedWorker: string;
        public isLoading: boolean;
        public noReason: any;

        private chartLegendState: any;
    }
}
