using BowlingWeb.Filters;
using BowlingWeb.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Data.SQLite;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace BowlingWeb.Controllers
{
    //[MyAuthorize]
    public class MemberController : Controller
	{
		private MemberService _service;

		public MemberController()
		{
			_service = new MemberService();
		}
		// 首頁
		public ActionResult Index()
        {
            return View();
        }
        // 註冊
        public ActionResult Register()
        {
            return View();
        }
        // 登入
        public ActionResult Login()
        {
            return View();
        }
        // 個人紀錄
        public ActionResult Record()
        {
            return View();
        }
        // 個人紀錄
        public ActionResult UsersRecord()
        {
            return PartialView();
        }
        // 統計圖表
        public ActionResult Chart()
        {
            return View();
        }

		// =============== Web API ================

		[HttpPost]
        public JsonResult GetAllMember()
        {
            var ret = _service.GetAllMember();
            return Json(ret);
        }
        [HttpPost]
        public JsonResult GetMember(Member member)
        {
            var ret = _service.GetMember(member);
            return Json(ret);
        }
        [HttpPost]
        public JsonResult CreateMember(Member member)
        {                
            var ret = _service.CreateMember(member);
            return Json(ret);
        }
    }
}