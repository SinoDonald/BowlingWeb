using BowlingWeb.Models;
using System.Collections.Generic;
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
        // 上傳資料
        public ActionResult Upload()
        {
            return View();
        }
        // 所有紀錄(顯示所有User)
        public ActionResult Record()
        {
            return View();
        }
        // 個人紀錄
        public ActionResult PersonalRecord()
        {
            return PartialView();
        }
        // 統計圖表
        public ActionResult Chart()
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

		// =============== Web API ================

        // 註冊
        [HttpPost]
        public JsonResult CreateMember(Member member)
        {                
            var ret = _service.CreateMember(member);
            return Json(ret);
        }
        // 登入
        [HttpPost]
        public JsonResult Login(Member member)
        {
            var ret = _service.Login(member);
            // 把登入者的資料傳進Session["Account"]做紀錄
            Session["Account"] = ret.Account;
            return Json(ret);
        }
        // 上傳檔案資訊
        [HttpPost]
        public ActionResult UpdateFileInfo(HttpPostedFileBase file)
        {
            Dictionary<string, object> ret = _service.UpdateFileInfo(file);
            return Json(ret);
        }
        // 上傳單一檔案
        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase file)
        {
            var ret = _service.Upload(file);
            return Json(ret);
        }
        // 讀取檔案
        [HttpPost]
        public ActionResult ReadExcel(string filePath)
        {
            var ret = _service.ReadExcel(filePath);
            return Json(ret);
        }
        // 個人紀錄
        [HttpPost]
        public JsonResult GetMember(string account)
        {
            account = @Session["Account"].ToString();
            var ret = _service.GetMember(account);
            return Json(ret);
        }
        [HttpPost]
        public JsonResult GetAllMember()
        {
            var ret = _service.GetAllMember();
            return Json(ret);
        }
    }
}