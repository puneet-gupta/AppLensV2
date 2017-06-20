using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AppLensV2
{
    public class SupportCenterSessionData
    {
        public string SessionId { get; set; }

        public DateTime Timestamp { get; set; }

        public List<SupportCenterEvent> Events { get; set; }

        public SupportCenterSessionData()
        {
            Events = new List<SupportCenterEvent>();
        }
    }

    public class SupportCenterEvent
    {
        public string EventName { get; set; }

        public DateTime Timestamp { get; set; }

        public NameValuePropertyBag EventData { get; set; }

        public SupportCenterEvent()
        {
            EventData = new NameValuePropertyBag();
        }
    }
}