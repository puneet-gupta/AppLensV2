///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class Constants {
        public static geoRegionApiRouteHeaderName: string = "GeoRegionApiRoute";
        public static aggregatedWorkerName: string = "aggregated";
    }

    export class UriPaths {

        private static siteDetails: string = "/api/sites/{siteName}";
        private static siteDetailsWithStamp: string = "/api/stamps/{stamp}/sites/{siteName}";
        private static appServiceEnvironmentDetails: string = "/api/hostingEnvironments/{hostingEnvironmentName}"
        private static diagnosticsPassThroughApiPath: string = "/api/diagnostics";
        private static detectorsDocumentAPIPath: string = "/api/detectors/{detectorName}/files/{fileName}";

        // Uri Paths of Geo Region Diagnostic Role APIs
        private static baseAPIPath: string = "subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Web/sites/{site}/diagnostics";
        private static commonQueryString: string = "stampName={stamp}&{hostnames}&startTime={start}&endTime={end}&timeGrain={grain}";
        private static appAnalysis: string = UriPaths.baseAPIPath + "/appAnalysis?" + UriPaths.commonQueryString;
        private static detectors: string = UriPaths.baseAPIPath + "/detectors";
        private static detectorResource: string = UriPaths.baseAPIPath + "/detectors/{detectorName}?" + UriPaths.commonQueryString;
        private static siteDiagnosticProperties: string = UriPaths.baseAPIPath + "/properties";

        // Uri Paths for feedback APIs
        private static caseFeedback: string = "/api/cases/{caseId}/feedback";
        private static detectorFeedback: string = "/api/detectors/{detectorName}/feedback";

        public static SiteDetailsPath(params: IStateParams): string {
            if (angular.isDefined(params.stamp) && params.stamp !== '') {
                return UriPaths.siteDetailsWithStamp.replace("{stamp}", params.stamp).replace("{siteName}", params.siteName);
            } else {
                return UriPaths.siteDetails.replace("{siteName}", params.siteName);
            }
        }

        // URI path to get details for ASE
        public static AppServiceEnvironmentDetails(params: IStateParams): string {
            if (angular.isDefined(params.hostingEnvironmentName) && params.hostingEnvironmentName !== '') {
                return UriPaths.appServiceEnvironmentDetails.replace("{hostingEnvironment}", params.hostingEnvironmentName);
            }
        }

        public static DiagnosticsPassThroughAPIPath(): string {
            return UriPaths.diagnosticsPassThroughApiPath;
        }

        public static DetectorsDocumentApiPath(detectorName: string, fileName: string): string {
            return UriPaths.detectorsDocumentAPIPath
                .replace("{detectorName}", detectorName)
                .replace("{fileName}", fileName);
        }

        public static CaseFeedbackPath(caseId: string): string {
            return UriPaths.caseFeedback
                .replace("{caseId}", caseId);
        }

        public static DetectorFeedbackPath(detectorName: string): string {
            return UriPaths.detectorFeedback
                .replace("{detectorName}", detectorName);
        }

        public static AppAnalysisPath(site: Site, startTime: string, endTime: string, timeGrain: string): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.appAnalysis, site, startTime, endTime, timeGrain);
        }

        public static ListDetectorsPath(resource: Resource): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.detectors, resource, '', '', '');
        }

        public static SiteDiagnosticPropertiesPath(site: Site): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.siteDiagnosticProperties, site, '', '', '');
        }

        public static DetectorResourcePath(site: Site, detectorName: string, startTime: string, endTime: string, timeGrain: string): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.detectorResource, site, startTime, endTime, timeGrain)
                .replace("{detectorName}", detectorName);
        }

        private static CreateGeoRegionAPIPath(pathFormat: string, resource: Resource, startTime: string, endTime: string, timeGrain: string): string {

            var path = pathFormat
                .replace("{sub}", resource.subscriptionId)
                .replace("{rg}", resource.resourceGroup)
                .replace("{site}", resource.resourceName)
                .replace("{stamp}", resource.resourceInternalStamp)
                .replace("{hostingenvironment}", resource.resourceName)
                .replace("{start}", startTime)
                .replace("{end}", endTime)
                .replace("{grain}", timeGrain);

            var site = resource as Site;
            if (site != null) {
                var hostNamesFilter = '';
                for (let hostname of site.hostNames) {
                    hostNamesFilter += "hostNames=" + hostname;

                    if (site.hostNames[site.hostNames.length - 1] != hostname) {
                        hostNamesFilter += "&";
                    }
                }

                path = path.replace("{hostnames}", hostNamesFilter);
            }

            return path;
        }
    }
}