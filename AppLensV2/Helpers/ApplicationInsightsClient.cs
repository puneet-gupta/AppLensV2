using Microsoft.ApplicationInsights;

namespace AppLensV2
{
    public class ApplicationInsightsClient
    {
        private static TelemetryClient instance;

        public static TelemetryClient Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new TelemetryClient();
                }

                return instance;
            }
        }
    }
}