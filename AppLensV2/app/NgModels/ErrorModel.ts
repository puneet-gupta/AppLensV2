///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class ErrorModel {
        constructor(
            public ErrorCode: number,
            public Message: string
        ) {
        }
    }

    export class ErrorModelBuilder {

        static Build(errObject: any): ErrorModel {

            var statusCode: number = 0;
            var message: string = '';

            if (angular.isDefined(errObject.status)) {
                statusCode = errObject.status;
            }

            if (angular.isDefined(errObject.data) && angular.isDefined(errObject.data.Message)) {
                message = errObject.data.Message;
            }
            else if (angular.isDefined(errObject.Message)) {
                message = errObject.Message;
            }

            return new ErrorModel(statusCode, message);
        } 
    }

}