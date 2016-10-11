///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class Constants {
        public static geoRegionApiRouteHeaderName: string = "GeoRegionApiRoute";
        public static aggregatedWorkerName: string = "aggregated";
    }

    export class UriPaths {

        private static siteDetails: string = "/api/sites/{siteName}";
        private static diagnosticsPassThroughApiPath: string = "/api/diagnostics";
        private static detectorsDocumentAPIPath: string = "/api/detectors/{detectorName}/files/{fileName}";

        // Uri Paths of Geo Region Diagnostic Role APIs
        private static baseAPIPath: string = "subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Web/sites/{site}/diagnostics";
        private static commonQueryString: string = "stampName={stamp}&{hostnames}&startTime={start}&endTime={end}";
        private static appAnalysis: string = UriPaths.baseAPIPath + "/appAnalysis?" + UriPaths.commonQueryString;
        private static detectors: string = UriPaths.baseAPIPath + "/detectors";
        private static detectorResource: string = UriPaths.baseAPIPath + "/detectors/{detectorName}?" + UriPaths.commonQueryString;

        public static SiteDetailsPath(siteName: string): string {
            return UriPaths.siteDetails.replace("{siteName}", siteName);
        }

        public static DiagnosticsPassThroughAPIPath(): string {
            return UriPaths.diagnosticsPassThroughApiPath;
        }

        public static DetectorsDocumentApiPath(detectorName: string, fileName: string): string {
            return UriPaths.detectorsDocumentAPIPath
                .replace("{detectorName}", detectorName)
                .replace("{fileName}", fileName);
        }

        public static AppAnalysisPath(site: Site, startTime: string, endTime: string): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.appAnalysis, site, startTime, endTime);
        }

        public static ListDetectorsPath(site: Site): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.detectors, site, '', '');
        }

        public static DetectorResourcePath(site: Site, detectorName: string, startTime: string, endTime: string): string {
            return UriPaths.CreateGeoRegionAPIPath(UriPaths.detectorResource, site, startTime, endTime)
                .replace("{detectorName}", detectorName);
        }

        private static CreateGeoRegionAPIPath(pathFormat: string, site: Site, startTime: string, endTime: string): string {

            var path = pathFormat
                .replace("{sub}", site.subscriptionId)
                .replace("{rg}", site.resourceGroup)
                .replace("{site}", site.name)
                .replace("{stamp}", site.stampName)
                .replace("{start}", startTime)
                .replace("{end}", endTime);

            var hostNamesFilter = '';

            for (let hostname of site.hostNames) {
                hostNamesFilter += "hostNames=" + hostname;

                if (site.hostNames[site.hostNames.length - 1] != hostname) {
                    hostNamesFilter += "&";
                }
            }

            path = path.replace("{hostnames}", hostNamesFilter);

            return path;
        }
    }
}