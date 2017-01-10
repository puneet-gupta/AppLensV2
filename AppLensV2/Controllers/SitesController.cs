using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Newtonsoft.Json.Linq;

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

        [HttpPost]
        [Route("api/cases/{caseId}/feedback")]
        public void CaseFeedback(string caseId, [FromBody]JToken jsonBody)
        {
            int feedbackOption = jsonBody.Value<int>("feedbackOption");
            string additionalNotes = jsonBody.Value<string>("additionalNotes");

            var properties = new Dictionary<string, string>();
            properties.Add("CaseId", caseId);
            properties.Add("FeedbackOption", feedbackOption.ToString());
            properties.Add("AdditionalNotes", additionalNotes);

            switch (feedbackOption)
            {
                case 0:
                    ApplicationInsightsClient.Instance.TrackMetric("APPLENS_RESULT_SUCCESS", 1);
                    break;
                case 1:
                    ApplicationInsightsClient.Instance.TrackMetric("APPLENS_RESULT_PARTIALSUCCESS", 1);
                    break;
                case 2:
                    ApplicationInsightsClient.Instance.TrackMetric("APPLENS_RESULT_FAILED", 1);
                    break;
            }

            ApplicationInsightsClient.Instance.TrackTrace(string.Format("CASE_FEEDBACK:{0}, FeedbackOption:{1}", caseId, feedbackOption), properties);
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
