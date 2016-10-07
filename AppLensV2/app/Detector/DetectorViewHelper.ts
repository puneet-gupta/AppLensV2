///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class DetectorViewHelper {

        constructor(private $window: angular.IWindowService) {
        }

        public GetChartOptions(detectorName: string = ''): any {

            var options: any = this.chartOptions;

            switch (detectorName.toLowerCase()) {
                case 'runtimeavailability':
                    options.chart.type = 'lineChart';
                    break;
            }

            return options;
        }

        public GetChartData(detectorResponse: DetectorResponse, detectorName: string = ''): any {

            var self = this;
            var chartData = [];

            // Workaround to round down time
            //until API is fixed.Issue - https://github.com/ShekharGupta1988/AppLensV2/issues/9
            var startTime = new Date(detectorResponse.StartTime);
            var endTime = new Date(detectorResponse.EndTime);

            var coeff = 1000 * 60 * 5;

            for (let metric of detectorResponse.Metrics) {

                var roundedStartTime = new Date(Math.round(startTime.getTime() / coeff) * coeff);
                var roundedEndTime = new Date(Math.round(endTime.getTime() / coeff) * coeff);

                var defaultValue: number = 0;
                if (metric.Name.toLowerCase().indexOf("availability") > -1) {
                    defaultValue = 100;
                }

                var dataSeries: any = {
                    key: metric.Name,
                    values: [],
                    area: false
                };

                for (var d = roundedStartTime; d < roundedEndTime; d.setTime(d.getTime() + coeff)) {

                    let xDate = new Date(d.getTime());
                    let yValue = defaultValue;

                    let element = _.find(metric.Values, function (item) {
                        var itemDate = new Date(item.Timestamp);

                        return itemDate.getTime() == xDate.getTime();
                    });

                    if (angular.isDefined(element)) {
                        yValue = element.Total;
                    }

                    dataSeries.values.push(
                        {
                            x: self.ConvertToUTCTime(xDate),
                            y: yValue
                        }
                    );
                }

                chartData.push(dataSeries);
            }

            return chartData;
        }

        public ConvertToUTCTime(localDate: Date): Date {
            var utcTime = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), localDate.getUTCHours(), localDate.getUTCMinutes(), localDate.getUTCSeconds());
            return utcTime;
        }

        private graphHeight: any = this.$window.innerHeight * 0.2;

        private chartOptions: any = {
            chart: {
                type: 'multiBarChart',
                height: this.graphHeight,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 60
                },
                useInteractiveGuideline: true,
                transitionDuration: 350,
                showLegend: true,
                stacked: true,
                clipEdge: false,
                showControls: false,
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                xAxis: {
                    showMaxMin: false,
                    axisLabel: 'Time (UTC)',
                    staggerLabels: true,
                    tickFormat: function (d) { return d3.time.format('%a %I %M %p')(new Date(d)); }
                },
                yAxis: {
                    axisLabel: '',
                    showMaxMin: false,
                    tickFormat: d3.format('.2f')
                }
            }
        };

        private defaultColors: [string] = ["", ""];
        public static runtimeAvailabilityColors: [string] = ["#117dbb", "hsl(120, 57%, 40%)"];
        public static requestsColors: [string] = ["#117dbb", "#aa0000"];

    }
}