///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetectorGoogleChartViewScope extends ng.IScope {
        loading: string;
        metricSets: DiagnosticMetricSet[];
        metricSetsDictionary: { [id: string]: DiagnosticMetricSet[] };
        detectorname: string;
    }

    export class DetectorGoogleChartCtrl {

    }

    export class DetectorGoogleChartDir implements ng.IDirective {
        public templateUrl: string = './app/DetailDetector/detaileddetectorview.html';
        public bindToController: boolean = true;
        public controllerAs: string = 'detectorgooglechartctrl';
        public controller = DetectorGoogleChartCtrl;
        public link = function (scope: IDetectorGoogleChartViewScope, ctrl: DetectorGoogleChartCtrl) {
        }

        public scope: { [boundProperty: string]: string } = {
            loading: '=',
            metricsets: '=',
            metricSetsDictionary: '=',
            detectorname: '='
        };
    }
}

