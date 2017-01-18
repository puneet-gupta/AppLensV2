///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HomeCtrl {
        public static $inject: string[] = ["$http", "$q", "$stateParams", "$state", "$window",];
        constructor(private $state: angular.ui.IStateService)
        {

        }

        sendToMain(siteName: string) {
            this.$state.go('main' + '/' + siteName);
        }
    }
}