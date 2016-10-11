using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace AppLensV2
{
    public sealed class GithubClient
    {
        private const string apiEndpoint = "https://api.github.com/repos/PraveenTB/AppLensDocs/contents/Documents/{0}/{1}?ref=master";

        public static async Task<string> GetFileContent(string detectorName, string fileName)
        {
            if(string.IsNullOrWhiteSpace(detectorName) || string.IsNullOrWhiteSpace(fileName))
            {
                return string.Empty;
            }

            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(60);
                client.MaxResponseContentBufferSize = Int32.MaxValue;
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Add("User-Agent", "AppName");
                try
                {
                    var response = await client.GetAsync(string.Format(apiEndpoint, detectorName, fileName));

                    if (response.IsSuccessStatusCode)
                    {
                        JObject responseOutput = await response.Content.ReadAsAsync<dynamic>();
                        var encodedContent = responseOutput["content"].ToString();
                        byte[] newBytes = Convert.FromBase64String(encodedContent);
                        string fileContent = Encoding.UTF8.GetString(newBytes);
                        return fileContent;
                    }
                }
                catch(Exception)
                {
                    throw;
                }


                return string.Empty; ;
            }
        }
    }
}