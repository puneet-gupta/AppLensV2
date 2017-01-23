///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HomeCtrl {
        public static $inject: string[] = ["$stateParams", "$state"];
        constructor(private $stateParams: IStateParams, private $state: angular.ui.IStateService) {
        }
        siteName: string;
        startTime: string;
        endTime: string;
        sendToMain() {
            this.$stateParams.siteName = this.siteName;
            if (angular.isDefined(this.startTime))
            {
                this.$stateParams.startTime = this.startTime
            };
            if (angular.isDefined(this.endTime)) {
                this.$stateParams.startTime = this.endTime
            };     
            this.$state.go('home', this.$stateParams);
        }
 
    }
}