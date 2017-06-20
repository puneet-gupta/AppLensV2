using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AppLensV2
{
    public class SupportCenterWorkflowData
    {
        public string TicketWorkflowId { get; set; }

        public DateTime Timestamp { get; set; }

        public string MsSolveCaseId { get; set; }

        public List<SupportCenterSessionData> Sessions { get; set; }

        public SupportCenterWorkflowData()
        {
            Sessions = new List<SupportCenterSessionData>();
        }
    }
}