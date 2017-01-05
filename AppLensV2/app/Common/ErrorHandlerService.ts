///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IErrorHandlerService {
        showError(message: any): void;
    }

    export class ErrorHandlerService implements IErrorHandlerService {
        static $inject = ['$mdDialog'];

        private isErrorShown: Boolean;

        constructor(private $mdDialog: angular.material.IDialogService) {
            this.isErrorShown = false;
        }

        showError(error: any): void {

            if (!this.isErrorShown) {

                this.isErrorShown = true;
                let self = this;

                var message: string = "Please try again after sometime. If the issue persists, please report the issue using feedback button.";

                if (angular.isDefined(error) && angular.isDefined(error.Message) && error.Message !== '') {
                    message = error.Message;
                }

                this.$mdDialog.show(
                    self.$mdDialog.alert()
                        .clickOutsideToClose(false)
                        .title('Error Encountered')
                        .textContent(message)
                        .ariaLabel('Error Encountered')
                        .ok('Got it!')
                ).then(function () {
                        self.isErrorShown = false;
                    }, function (err) {
                        self.isErrorShown = false;
                    });
            }
        }
    }
}