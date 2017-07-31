module SupportCenter {
    "use strict";

    export class DetectorViewConfig implements ng.IDirective {
        public templateUrl: string | ((tElement: JQuery, tAttrs: angular.IAttributes) => string);
        public controller : string | angular.Injectable<angular.IControllerConstructor>;
    }

    export class DetectorViewFactory {
        static getDetectorViewConfig(detectorName: string): ng.IDirective {
            let config = new DetectorViewConfig() as ng.IDirective;
            switch (detectorName) {
                default:
                    break;
            }

            return config;
        }
    }

}