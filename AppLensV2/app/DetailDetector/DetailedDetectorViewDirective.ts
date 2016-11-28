///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetailedDetectorViewScope extends ng.IScope {
        loading: string;
        metricsets: DiagnosticMetricSet[];
        chartoptions: any;
        chartdata: any;
        //info: any;
        //responsemetadata: any;
        //: string;
        //: string;
        //additionaldata: any;
    }

    export interface IDetailedDetectorCtrl  {
        
    }

    export class DetailedDetectorViewCtrl implements IDetailedDetectorCtrl {
        public static $inject: string[] = ["DetectorsService", "$stateParams", "$window"];
        public metricsets: DiagnosticMetricSet[];
        public helper: DetectorViewHelper;
        public graphData: any;
        public allMetrics: DetailedGraphData;
        public chartoptions: any;
        public selectedWorker: string;

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private $window: angular.IWindowService) {
            var self = this;
            this.helper = new DetectorViewHelper($window);
            this.allMetrics = this.helper.GetDetailedChartData(this.metricsets);

            var now = new Date();
            this.graphData = _.filter(this.allMetrics.metricData, function (item) {
                return item.instance === self.allMetrics.instanceList[0] && item.key.indexOf("_Total") == -1;
            });
            console.log(this.chartoptions);
            this.chartoptions = this.helper.GetChartOptions('cpuanalysisdetailed');
            this.chartoptions.chart.height = this.chartoptions.chart.height * 2;
            this.chartoptions.chart.showLegend = false;
            this.chartoptions.chart.tooltipContent = function (key, x, y, e, graph) {
                if (key == '1')
                    return '<div id="tooltipcustom">' + '<p id="head">' + x + '</p>' +
                        '<p>' + y + ' cent/kWh/h/Runtime ' + '</p></div>'
            };
            //this.chartoptions.chart.type = 'stackedAreaGraph';
            console.log(this.chartoptions);
            console.log(new Date().getTime() - now.getTime());
        }
    }

    export class DetailedDetectorViewDir implements ng.IDirective {

        public restrict: string = 'E';
        public replace: boolean = true;
        public templateUrl: string = './app/DetailDetector/detaileddetectorview.html';
        public bindToController: boolean = true;
        public controllerAs: string = 'detailedctrl';
        public controller = DetailedDetectorViewCtrl;
        public link = function (scope: IDetailedDetectorViewScope, ctrl: IDetailedDetectorCtrl) {
        }

        public scope: { [boundProperty: string]: string } = {
            loading: '=',
            metricsets: '=',
            chartoptions: '=',
            chartdata: '=',
            //info: '=',
           // responsemetadata: '=',
            //wiki: '=',
            //solution: '=',
            //additionaldata: '='
        };
    }
}