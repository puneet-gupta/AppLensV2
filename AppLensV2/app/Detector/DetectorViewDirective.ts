///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetectorViewScope extends ng.IScope {
        loading: string;
        chartoptions: any;
        chartdata: any;
        info: any;
        responsemetadata: any;
    }

    export class DetectorViewCtrl {
        public static $inject: string[] = ["DetectorsService", "$stateParams", "$window"];

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private $window: angular.IWindowService) {

            var self = this;
            let detectorName = "A";
            this.wikiContent = '';
            this.solutionContent = '';

            this.DetectorsService.getDetectorWiki(detectorName).then(function (wikiResponse) {
                self.wikiContent = wikiResponse;
            });

            this.DetectorsService.getDetectorSolution(detectorName).then(function (solutionRespons) {
                self.solutionContent = solutionRespons;
            });
        }
        
        wikiContent: string;
        solutionContent: string;
    }

    export class DetectorViewDir implements ng.IDirective {

        public restrict: string = 'E';
        public replace: boolean = true;
        public templateUrl: string = './app/Detector/detectorview.html';
        public bindToController: boolean = true;
        public controllerAs: string = 'detectorviewctrl';
        public controller = DetectorViewCtrl;
        public link = function (scope: IDetectorViewScope) {
        }

        public scope: { [boundProperty: string]: string } = {
            loading: '=',
            chartoptions: '=',
            chartdata: '=',
            info: '=',
            responsemetadata:'='
        };
    }
}