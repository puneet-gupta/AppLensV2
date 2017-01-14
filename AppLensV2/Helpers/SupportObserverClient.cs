using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using AppLensV2.Helpers;
using Newtonsoft.Json;
using System.Net;

namespace AppLensV2
{
    public class ObserverResponse
    {
        public HttpStatusCode StatusCode;

        public dynamic Content;
    }

    /// <summary>
    /// Client for Support Observer API communication
    /// </summary>
    public sealed class SupportObserverClient
    {

        /// <summary>
        /// Support API Endpoint
        /// </summary>
        private static string SupportObserverApiEndpoint {
            get
            {
                bool targetSupportApiTestSlot;
                bool.TryParse(ConfigurationManager.AppSettings["TargetSupportApiTestSlot"], out targetSupportApiTestSlot);

                //Add condition for Debugger.IsAttached so that we never mistakenly target Support Api test slot in production
                if (Debugger.IsAttached && targetSupportApiTestSlot)
                {
                    return "https://support-bay-api-test.azurewebsites.net/observer/";
                }else
                {
                    return "https://support-bay-api.azurewebsites.net/observer/";
                }
            }
        }
        
        /// <summary>
        /// Signing Key
        /// </summary>
        private static string hashKey;

        /// <summary>
        /// http client
        /// </summary>
        private static readonly Lazy<HttpClient> _client = new Lazy<HttpClient>(() =>
            {
                var client = new HttpClient();
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.Timeout = TimeSpan.FromSeconds(30);

                return client;
            }
        );

        /// <summary>
        /// http client
        /// </summary>
        private static HttpClient _httpClient
        {
            get
            {
                return _client.Value;
            }
        }

        /// <summary>
        /// Signing Key
        /// </summary>
        public static string SimpleHashAuthenticationHashKey
        {
            get
            {
                if (string.IsNullOrEmpty(hashKey))
                {
                    if (Debugger.IsAttached)
                    {
                        hashKey =
                            ConfigHelper.Evaluate(ConfigurationManager.AppSettings["SimpleHashAuthenticationHashKey"]);
                    }
                    else
                    {
                        hashKey = Environment.GetEnvironmentVariable("APPSETTING_SimpleHashAuthenticationHashKey");
                    }
                }

                return hashKey;
            }
        }

        /// <summary>
        /// Get site details for siteName
        /// </summary>
        /// <param name="siteName">Site Name</param>
        internal static async Task<ObserverResponse> GetSite(string siteName)
        {
            return await GetSiteInternal(SupportObserverApiEndpoint + "sites/" + siteName + "/adminsites?api-version=2.0", string.Format("{{\"site\":\"{0}\"}}", siteName));
        }

        /// <summary>
        /// Get site details for siteName
        /// </summary>
        /// <param name="stamp">Stamp</param>
        /// <param name="siteName">Site Name</param>
        internal static async Task<ObserverResponse> GetSite(string stamp, string siteName)
        {
            return await GetSiteInternal(SupportObserverApiEndpoint + "stamps/" + stamp + "/sites/" + siteName + "/adminsites?api-version=2.0",
                string.Format("{{\"stamp\":\"{0}\",\"site\":\"{1}\"}}", stamp, siteName));
        }

        private static async Task<ObserverResponse> GetSiteInternal(string endpoint, string hashInput)
        {
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(endpoint),
                Method = HttpMethod.Get
            };
            
            request.Headers.Add("client-hash", SignData(hashInput, SimpleHashAuthenticationHashKey));
            var response = await _httpClient.SendAsync(request);

            ObserverResponse res = await CreateObserverResponse(response, "GetAdminSite");
            return res;
        }

        /// <summary>
        /// Get resource group for site
        /// </summary>
        /// <param name="site">Site</param>
        /// <returns>Resource Group</returns>
        internal static async Task<dynamic> GetResourceGroup(string site)
        {
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(SupportObserverApiEndpoint + "sites/" + site + "/resourcegroupname?api-version=2"),
                Method = HttpMethod.Get
            };
          
            var serializedParameters = JsonConvert.SerializeObject(new Dictionary<string, string>() { { "site", site } });
            request.Headers.Add("client-hash", SignData(serializedParameters, SimpleHashAuthenticationHashKey));
            var response = await _httpClient.SendAsync(request);

            ObserverResponse res = await CreateObserverResponse(response, "GetResourceGroup(2.0)");
            return res;
        }

        /// <summary>
        /// Get Stamp for siteName
        /// </summary>
        /// <param name="siteName">Site Name</param>
        /// <returns>Stamp</returns>
        internal static async Task<ObserverResponse> GetStamp(string siteName)
        {
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(SupportObserverApiEndpoint + "sites/" + siteName + "/stamp"),
                Method = HttpMethod.Get
            };

            var serializedParameters = JsonConvert.SerializeObject(new Dictionary<string, string>() { { "site", siteName } });
            request.Headers.Add("client-hash", SignData(serializedParameters, SimpleHashAuthenticationHashKey));
            var response = await _httpClient.SendAsync(request);

            ObserverResponse res = await CreateObserverResponse(response, "GetStamp");
            return res;
        }

        /// <summary>
        /// Get Hostnames for a site
        /// </summary>
        /// <param name="siteName">SiteName</param>
        /// <returns>Hostnames</returns>
        internal static async Task<ObserverResponse> GetHostnames(string siteName)
        {
            var request = new HttpRequestMessage()
            {
                RequestUri = new Uri(SupportObserverApiEndpoint + "sites/" + siteName + "/hostnames?api-version=2.0"),
                Method = HttpMethod.Get
            };

            var serializedParameters = JsonConvert.SerializeObject(new Dictionary<string, string>() { { "site", siteName } });
            request.Headers.Add("client-hash", SignData(serializedParameters, SimpleHashAuthenticationHashKey));
            var response = await _httpClient.SendAsync(request);

            ObserverResponse res = await CreateObserverResponse(response, "GetHostnames(2.0)");
            return res;
        }

        /// <summary>
        /// Sign Data
        /// </summary>
        /// <param name="data">data</param>
        /// <param name="key">key</param>
        /// <returns>hash value</returns>
        private static string SignData(string data, string key)
        {
            var signedList = new List<string>();
            using (var hmacSha1 = new HMACSHA1())
            {
                hmacSha1.Key = Encoding.UTF8.GetBytes(key);
                byte[] hashBytes = hmacSha1.ComputeHash(Encoding.UTF8.GetBytes(data));
                return Convert.ToBase64String(hashBytes);
            }
        }

        private static async Task<ObserverResponse> CreateObserverResponse(HttpResponseMessage response, string apiName = "")
        {
            var observerResponse = new ObserverResponse();

            if (response == null)
            {
                observerResponse.StatusCode = HttpStatusCode.InternalServerError;
                observerResponse.Content = "Unable to fetch data from Observer API : " + apiName;
            }

            observerResponse.StatusCode = response.StatusCode;

            if (response.IsSuccessStatusCode)
            {
                observerResponse.Content = await response.Content.ReadAsAsync<dynamic>();
            }
            else if(response.StatusCode == HttpStatusCode.NotFound)
            {
                observerResponse.Content = (string)"Resource Not Found. API : " + apiName;
            }
            else
            {
                observerResponse.Content = (string)"Unable to fetch data from Observer API : " + apiName;
            }

            return observerResponse;
        }
    }
}