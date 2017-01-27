///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class HomeCtrl {
        public static $inject: string[] = ["$stateParams", "$state"];
        constructor(private $stateParams: IStateParams, private $state: angular.ui.IStateService) {
        }

        siteName: string;
        endTimeOrig: Date = new Date();
        endTime: Date = new Date(this.endTimeOrig.getFullYear(), this.endTimeOrig.getMonth(), this.endTimeOrig.getDate(), this.endTimeOrig.getHours(), this.endTimeOrig.getMinutes());
        startTime: Date = new Date(this.endTime.getFullYear(), this.endTime.getMonth(), this.endTime.getDate() - 1, this.endTime.getHours(), this.endTime.getMinutes());
            
        startTimeStr: string = this.startTime.toISOString();
        endTimeStr: string = this.endTime.toISOString();
        
        sendToMain() {
            this.$stateParams.siteName = this.siteName;
            if (angular.isDefined(this.startTime))
            {
                this.$stateParams.startTime = this.startTimeStr;
            };
            if (angular.isDefined(this.endTime)) {
                this.$stateParams.endTime = this.endTimeStr;
            };     
            this.$state.go('home', this.$stateParams);
        }


 
    }
}