﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BowlingWeb.Models
{
    public static class HtmlHelperExtensions
    {
        public static HtmlString Versioned(this UrlHelper helper, string target)
        {
            if (!HttpContext.Current.IsDebuggingEnabled)
            {
                var minTarget = target.Substring(0, target.Length - 2) + "min.js";

                if (File.Exists(HttpContext.Current.Server.MapPath(minTarget)))
                {
                    target = minTarget;
                }

                var file = HttpContext.Current.Server.MapPath(target);
                DateTime lastModifiedDate = File.GetLastWriteTime(file);
                string versionedUrl = $"{target}?v={lastModifiedDate.Ticks}";

                return new HtmlString(helper.Content(versionedUrl));
            }

            return new HtmlString(helper.Content(target));
        }
    }
}