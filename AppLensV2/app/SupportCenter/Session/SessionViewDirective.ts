///<reference path="../../references.ts" />

module SupportCenter {
    "use strict";

    export interface ISessionViewScope extends ng.IScope {
        uimodel: any;
        sessiondata: any;
    }

    export class SessionViewCtrl {
        constructor() {
        }
    }

    export class SessionViewDir implements ng.IDirective {

        public restrict: string = 'E';
        public replace: boolean = true;
        public templateUrl: string = './app/SupportCenter/Session/sessionview.html';
        public bindToController: boolean = true;
        public controllerAs: string = 'sessionviewctrl';
        public controller = SessionViewCtrl;
        public link = function (scope: ISessionViewScope) {
        }

        public scope: { [boundProperty: string]: string } = {
            uimodel: '=',
            sessiondata: '='
        };
    }
}