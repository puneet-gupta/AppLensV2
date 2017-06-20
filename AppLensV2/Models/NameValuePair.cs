using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AppLensV2
{
    public class NameValuePair
    {
        public string Name { get; set; }
        
        public string Value { get; set; }
    }

    public class NameValuePropertyBag : List<NameValuePair>
    {
        public NameValuePropertyBag()
        {
        }
        
        /// <param name="nameValuePairs"></param>
        public NameValuePropertyBag(List<NameValuePair> nameValuePairs)
            : base(nameValuePairs)
        {
        }
    }
}