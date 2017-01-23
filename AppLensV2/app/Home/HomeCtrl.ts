///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HomeCtrl {
        public static $inject: string[] = ["$stateParams", "$state"];
        constructor(private $stateParams: IStateParams, private $state: angular.ui.IStateService) {
        }
        siteName: string;
        sendToMain() {
            this.$stateParams.siteName = this.siteName;
            this.$state.go('home', this.$stateParams);
        }
 
    }
}