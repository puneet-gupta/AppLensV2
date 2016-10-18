using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.ExceptionHandling;

namespace AppLensV2
{
    public class APIExceptionLogger : ExceptionLogger
    {
        public override void Log(ExceptionLoggerContext context)
        {
            if (context != null && context.Exception != null)
            {
                ApplicationInsightsClient.Instance.TrackException(context.Exception);
            }

            base.Log(context);
        }
    }
}