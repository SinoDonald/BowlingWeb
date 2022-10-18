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
        // 統計圖表
        public ActionResult Chart()
        {
            return View();
        }

        // =============== Web API ================
        [HttpPost]
        public JsonResult GetAllUser()
        {
            var ret = _service.GetAllSelfAssessments();
            return Json(ret);
        }

        [HttpPost]
        public bool CreateResponse(List<Member> assessments, string state, string year)
        {
            bool ret = _service.UpdateResponse(assessments, Session["empno"].ToString(), state, year);
            return ret;
        }
    }
}