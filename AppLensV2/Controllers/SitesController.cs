using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace AppLensV2
{
    public class SitesController : ApiController
    {
        [HttpGet]
        [Route("api/diagnostics")]
        public async Task<HttpResponseMessage> GetDiagnosticResult()
        {
            IEnumerable<string> temp = null;
            string apiRoute = null;
            if (Request.Headers.TryGetValues("GeoRegionApiRoute", out temp))
            {
                apiRoute = temp.FirstOrDefault().ToString();
            }

            var response =  await GeoRegionClient.GetResource(apiRoute);
            return response;
        }

        [HttpGet]
        [Route("api/sites/{siteName}")]
        public async Task<IHttpActionResult> GetSite(string siteName)
        {
            var stampTask = SupportObserverClient.GetStamp(siteName);
            var hostnamesTask = SupportObserverClient.GetHostnames(siteName);
            var siteDetailsTask = SupportObserverClient.GetSite(siteName);

            var stampResponse = await stampTask;
            var hostNameResponse = await hostnamesTask;
            var siteDetailsResponse = await siteDetailsTask;

            if (siteDetailsResponse.StatusCode != HttpStatusCode.OK)
            {
                return ResponseMessage(Request.CreateErrorResponse(siteDetailsResponse.StatusCode, (string)siteDetailsResponse.Content));
            }

            if (hostNameResponse.StatusCode != HttpStatusCode.OK)
            {
                return ResponseMessage(Request.CreateErrorResponse(hostNameResponse.StatusCode, (string)hostNameResponse.Content));
            }

            if (stampResponse.StatusCode != HttpStatusCode.OK)
            {
                return ResponseMessage(Request.CreateErrorResponse(stampResponse.StatusCode, (string)stampResponse.Content));
            }
            
            var resourceGroupResponse =  await SupportObserverClient.GetResourceGroup((string)siteDetailsResponse.Content.First.SiteName);

            if (resourceGroupResponse.StatusCode != HttpStatusCode.OK)
            {
                return ResponseMessage(Request.CreateErrorResponse(siteDetailsResponse.StatusCode, (string)siteDetailsResponse.Content));
            }

            siteDetailsResponse.Content.First.ResourceGroupName = resourceGroupResponse.Content;

            return Ok(new
            {
                SiteName = siteName,
                Details = siteDetailsResponse.Content,
                Stamp = stampResponse.Content,
                HostNames = hostNameResponse.Content
            });
        }
        
        [HttpGet]
        [Route("api/detectors/{detectorName}/files/{fileName}")]
        public async Task<IHttpActionResult> GetDetectorFiles(string detectorName, string fileName)
        {
            var result = await GithubClient.GetFileContent(detectorName, fileName);
            return Ok(result);
        }
    }
}
