using BowlingWeb.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace BowlingWeb.Filters
{
    public class MyAuthorizeAttribute : AuthorizeAttribute
    {
        private IMemberRepository _memberRepository;
        public MyAuthorizeAttribute()
        {
            _memberRepository = new MemberRepository();
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (!httpContext.User.Identity.IsAuthenticated)
                return false;
            return true;
        }

        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);

            if (filterContext.Result is HttpUnauthorizedResult)
            {
                filterContext.HttpContext.Response.Redirect("~/Error/Unauthorized/" +
                filterContext.HttpContext.User.Identity.Name);
                filterContext.Result = new EmptyResult();
                return;
            }

            string loginUser = filterContext.HttpContext.User.Identity.Name;
            string password = filterContext.HttpContext.User.Identity.Name;
            Match m = Regex.Match(loginUser, @"\\{0,1}(\d{4})@{0,1}");
            if (m.Success)
                loginUser = m.Groups[1].ToString();
                password = m.Groups[1].ToString();
            //-------------------------------------------------------

            Member member = new Member();
            if (filterContext.HttpContext.Session["empno"] == null)
            {
                var ret = _memberRepository.Get(member);

                if (ret != null)
                {
                    //Get Userinfo
                    //filterContext.HttpContext.Session["empno"] = loginUser;
                    filterContext.HttpContext.Session["Id"] = ret.Account;
                    filterContext.HttpContext.Session["Name"] = ret.Name;
                    filterContext.HttpContext.Session["Email"] = ret.Email;
                    filterContext.HttpContext.Session["Password"] = ret.Password;
                    filterContext.HttpContext.Session["SkillScores"] = ret.SkillScores;

                    filterContext.HttpContext.Session["role"] = null;
                    filterContext.HttpContext.Session["leader"] = null;

                    if (ret.Name.Equals("Donald"))
                    {
                        filterContext.HttpContext.Session["leader"] = true;
                    }
                    if (ConfigurationManager.AppSettings["Admin"].Contains(ret.Name))
                    {
                        filterContext.HttpContext.Session["Admin"] = true;
                    }
                }
                else
                {
                    filterContext.HttpContext.Response.Redirect("~/Error/Unauthorized/"
                    );
                    filterContext.Result = new EmptyResult();
                    return;
                }
            }
        }
    }
}