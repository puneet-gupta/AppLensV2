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
        public detailedchartoptions: any;
        public selectedworker: string;
        public selectedWorker: string;
        public selectedProcesses: string[];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private $window: angular.IWindowService) {
            var self = this;
            this.helper = new DetectorViewHelper($window);
            this.allMetrics = this.helper.GetDetailedChartData(this.metricsets);

            if (!angular.isDefined(this.selectedworker) || this.allMetrics.instanceList.indexOf(this.selectedworker) < 0) {
                this.selectedWorker = this.allMetrics.instanceList[0];
            }
            else {
                this.selectedWorker = this.selectedworker;
            }

            this.selectedProcesses = this.allMetrics.processList;

            this.detailedchartoptions = this.helper.GetChartOptions('cpuanalysisdetailed');
            this.detailedchartoptions.chart.height = this.detailedchartoptions.chart.height * 2;
            this.updateGraphData();
        }

        public updateGraphData() {
            var self = this;
            this.graphData = _.filter(this.allMetrics.metricData, function (item: GraphSeries) {
                return item.instance === self.selectedWorker;
            });
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
            selectedworker: '='
        };
    }
}