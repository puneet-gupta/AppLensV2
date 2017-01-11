///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetectorViewScope extends ng.IScope {
        loading: string;
        chartoptions: any;
        chartdata: any;
        info: any;
        responsemetadata: any;
        wiki: string;
        solution: string;
        additionaldata: any;
        metricsets: DiagnosticMetricSet[];
        selectedworker: string;
        detectorsource: string;
        abnormaltimeperiod: AbnormalTimePeriod;
    }

    export class DetectorViewCtrl {
        public static $inject: string[] = ["DetectorsService", "$stateParams", "$window", "FeedbackService", "$mdToast", "$timeout"];
        public showDetailedView: boolean = false;
        public detectorFeedbackOption: number = -1;
        private nameElement: any;
        private detectorName: string;

        constructor(private DetectorsService: IDetectorsService, private $stateParams: IStateParams, private $window: angular.IWindowService, private FeedbackService: IFeedbackService, private $mdToast: angular.material.IToastService, private $timeout: ng.ITimeoutService) {
            this.nameElement = document.getElementById('name');
            let self = this;

            this.$timeout(function () {
                self.detectorName = self.nameElement.innerText;

                if (angular.isDefined(FeedbackService.detectorsFeedbackList[self.detectorName])) {
                    self.detectorFeedbackOption = FeedbackService.detectorsFeedbackList[self.detectorName];
                }
            }, 3000);
        }

        sendDetectorFeedback(detectorName: string, feedbackOption: number) {

            if (this.detectorFeedbackOption === -1) {
                this.detectorFeedbackOption = feedbackOption;
                let self = this;
                this.FeedbackService.sendDetectorFeedback(detectorName, feedbackOption).then(function (answer) {
                    if (angular.isDefined(answer) && answer === true) {
                        self.$mdToast.showSimple("Feedback submitted successfully.Thank you !!");
                        self.FeedbackService.detectorsFeedbackList[detectorName] = feedbackOption;
                    }
                }, function () {
                });
            }
        }
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
            responsemetadata: '=',
            wiki: '=',
            solution: '=',
            additionaldata: '=',
            metricsets: '=',
            selectedworker: '=',
            detectorsource: '=',
            abnormaltimeperiod: '=',
        };
    }
}