module SupportCenter {
    "use strict";

    export interface IAnalysisResponse {
        getAnalysisResponse(): ng.IPromise<IAnalysisResult>;
    }
}