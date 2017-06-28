using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AppLensV2
{
    public class Utilities
    {
        public static DateTime GetDateTimeInUtcFormat(DateTime dateTime)
        {
            if (dateTime.Kind == DateTimeKind.Unspecified)
            {
                return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, dateTime.Hour, dateTime.Minute, dateTime.Second, dateTime.Millisecond, DateTimeKind.Utc);
            }

            return dateTime.ToUniversalTime();
        }
    }
}