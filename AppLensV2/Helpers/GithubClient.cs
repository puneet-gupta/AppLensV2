using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace AppLensV2
{
    public static class GithubClient
    {
        private static string githubClientId;
        private static string githubClientSecret;
        private static Random random = new Random();
        private const string apiEndpoint = "https://api.github.com/repos/PraveenTB/AppLensDocs/contents/Documents/{0}/{1}?ref=master&client_id={2}&client_secret={3}";
    
        public static string GithubClientId
        {
            get
            {
                if (string.IsNullOrWhiteSpace(githubClientId))
                {
                    if (!Debugger.IsAttached)
                    {
                        githubClientId = Environment.GetEnvironmentVariable("APPSETTING_GithubClientId");
                    }
                    else
                    {
                        githubClientId = string.Empty;
                    }
                }

                return githubClientId;
            }
        }

        public static string GithubClientSecret
        {
            get
            {
                if (string.IsNullOrWhiteSpace(githubClientSecret))
                {
                    if (!Debugger.IsAttached)
                    {
                        githubClientSecret = Environment.GetEnvironmentVariable("APPSETTING_GithubClientSecret");
                    }
                    else
                    {
                        githubClientSecret = string.Empty;
                    }
                }

                return githubClientSecret;
            }
        }

        /// <summary>
        /// Documents Cache. Needed to stay within api limits for github.
        /// Key is (detector name, document name)
        /// Value is (ETAG from previous request, document content)
        /// </summary>
        private static ConcurrentDictionary<Tuple<string, string>, Tuple<string, string>> documentsCache = new ConcurrentDictionary<Tuple<string, string>, Tuple<string, string>>();

        public static async Task<string> GetFileContent(string detectorName, string fileName)
        {
            if(string.IsNullOrWhiteSpace(detectorName) || string.IsNullOrWhiteSpace(fileName))
            {
                return string.Empty;
            }

            // 1. Check if ETAG for the requested document is present in memory cache or not.
            // 2. If ETAG is present, add ETAG to the request header and make the request to github api.
            // 3. If the response code is 304(Not-Modified), return the document stored in cache
            // 4. If the response code is 200, store the response text in cache as well as ETAG.

            string etag = null;
            string cachedDoc = string.Empty;
            string responseContent = string.Empty;
            var key = new Tuple<string, string>(detectorName, fileName);

            if (documentsCache.ContainsKey(key))
            {
                etag = documentsCache[key].Item1;
                cachedDoc = documentsCache[key].Item2;
            }

            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(60);
                client.MaxResponseContentBufferSize = Int32.MaxValue;
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Add("User-Agent", RandomString(6));
                if (!string.IsNullOrWhiteSpace(etag))
                {
                    client.DefaultRequestHeaders.Add("If-None-Match", etag);
                }

                try
                {
                    var response = await client.GetAsync(string.Format(apiEndpoint, detectorName, fileName, GithubClientId, GithubClientSecret));

                    if (response.IsSuccessStatusCode)
                    {
                        JObject responseOutput = await response.Content.ReadAsAsync<dynamic>();
                        var encodedContent = responseOutput["content"].ToString();
                        byte[] newBytes = Convert.FromBase64String(encodedContent);
                        responseContent = Encoding.UTF8.GetString(newBytes);

                        string newEtag = null;
                        IEnumerable<string> etagValues = new List<string>();
                        if(response.Headers.TryGetValues("ETag", out etagValues))
                        {
                            newEtag = etagValues.FirstOrDefault();
                        }

                        if (!string.IsNullOrWhiteSpace(newEtag))
                        {
                            Tuple<string, string> newCacheValue = new Tuple<string, string>(newEtag, responseContent);

                            if (documentsCache.ContainsKey(key))
                            {
                                Tuple<string, string> oldValue = null;
                                documentsCache.TryGetValue(key, out oldValue);
                                documentsCache.TryUpdate(key, newCacheValue, oldValue);
                            }
                            else
                            {
                                documentsCache.TryAdd(key, newCacheValue);
                            }
                        }
                    }
                    else if (response.StatusCode == HttpStatusCode.NotModified)
                    {
                        responseContent = cachedDoc;
                    }
                }
                catch(Exception)
                {
                    throw;
                }
                
                return responseContent;
            }
        }

        private static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}