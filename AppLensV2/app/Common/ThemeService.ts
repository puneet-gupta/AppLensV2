///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IThemeService {
        getTheme(): string;
    }

    export class ThemeService implements IThemeService {

        public static $inject: string[] = ["$state"];

        constructor(private $state: angular.ui.IStateService) { }


        getTheme(): string {
            return this.$state.current.name.indexOf('perfanalysis') > 0 ? 'default2' : 'default';
        }
    }
}