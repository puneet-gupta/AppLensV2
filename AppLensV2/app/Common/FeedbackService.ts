///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IFeedbackService {
        sendGeneralFeedback(): void;
        sendCaseFeedback(caseNumber: string, feedbackOption: number, additionalNotes: string): ng.IPromise<boolean>;
        sendDetectorFeedback(detectorName: string, feedbackOption: number): ng.IPromise<boolean>;
        detectorsFeedbackList: ICache<number>;
    }

    export class FeedbackService implements IFeedbackService {
        static $inject = ['$q', '$http', '$stateParams', '$window'];

        public detectorsFeedbackList: ICache<number>;

        constructor(private $q: ng.IQService, private $http: ng.IHttpService, private $stateParams: IStateParams, private $window: ng.IWindowService) {
            this.detectorsFeedbackList = {};
        }

        private getCurrentUrlFillMissingData(): string {
            var currentUrl = this.$window.location.href;
            if (currentUrl.indexOf('startTime') < 0 && currentUrl.indexOf('endTime') < 0) {
                var startTime = 'startTime={date}'.replace('{date}', new Date(new Date().setHours(new Date().getHours() - 24)).toISOString());
                currentUrl += (currentUrl.indexOf('?') < 0 ? '?' : '&') + startTime;
            }
            return currentUrl;
        }

        sendGeneralFeedback(): void {
            var subject = encodeURIComponent('Applensv2 Feedback');
            var body = encodeURIComponent('Current site: ' + this.getCurrentUrlFillMissingData() + '\n'
                + 'Please provide feedback here:');
            var link: string = 'mailto:applensdisc@microsoft.com?subject={subject}&body={body}';
            var link = link.replace('{subject}', subject).replace('{body}', body);
            window.location.href = link;
        }

        sendCaseFeedback(caseId: string, feedbackOption: number, additionalNotes: string): ng.IPromise<boolean> {

            var deferred = this.$q.defer<boolean>();

            this.$http({
                method: "POST",
                url: UriPaths.CaseFeedbackPath(caseId),
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    'feedbackOption': feedbackOption,
                    'additionalNotes': additionalNotes,
                    'url': this.getCurrentUrlFillMissingData()
                }
            }).then(function (data) {
                deferred.resolve(true);
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        sendDetectorFeedback(detectorName: string, feedbackOption: number): ng.IPromise<boolean> {

            var deferred = this.$q.defer<boolean>();
            this.$http({
                method: "POST",
                url: UriPaths.DetectorFeedbackPath(detectorName),
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    'feedbackOption': feedbackOption,
                    'url': this.getCurrentUrlFillMissingData()
                }
            }).then(function (data) {
                deferred.resolve(true);
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }
    }
}