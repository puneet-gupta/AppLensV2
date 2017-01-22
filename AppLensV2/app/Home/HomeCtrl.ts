///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HomeCtrl {
        public static $inject: string[] = ["$scope","$http", "$q", "$stateParams", "$state", "$window"];
        constructor(private $scope, $http: ng.IHttpService, private $q: ng.IQService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService) {
        }

        sendToMain() {
            this.$stateParams.siteName = this.$scope.siteName;
            this.$state.go('home', this.$stateParams);
        }
 
    }
}