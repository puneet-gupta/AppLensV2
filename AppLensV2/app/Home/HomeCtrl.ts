///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HomeCtrl {
        public static $inject: string[] = ["$stateParams", "$state"];
        constructor(private $stateParams: IStateParams, private $state: angular.ui.IStateService) {
        }

        siteName: string;
        aseName: string;
        endTimeOrig: Date = new Date();
        endTime: Date = new Date(this.endTimeOrig.getFullYear(), this.endTimeOrig.getMonth(), this.endTimeOrig.getDate(), this.endTimeOrig.getHours(), this.endTimeOrig.getMinutes());
        startTime: Date = new Date(this.endTime.getFullYear(), this.endTime.getMonth(), this.endTime.getDate() - 1, this.endTime.getHours(), this.endTime.getMinutes());
            
        startTimeStr: string = this.startTime.toISOString();
        endTimeStr: string = this.endTime.toISOString();
        
        sendToMain(resourceType: string) {

            if (angular.isDefined(this.startTime)) {
                this.$stateParams.startTime = this.startTimeStr;
            };
            if (angular.isDefined(this.endTime)) {
                this.$stateParams.endTime = this.endTimeStr;
            };     

            if (resourceType === 'site') {
                this.$stateParams.siteName = this.siteName;
                this.$state.go('sites', this.$stateParams);
            }
            else if (resourceType === 'ase') {
                this.$stateParams.hostingEnvironmentName = this.aseName;
                this.$state.go('home3', this.$stateParams);
            }
        }
    }
}