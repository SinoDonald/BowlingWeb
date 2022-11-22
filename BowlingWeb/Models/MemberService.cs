using BowlingWeb.Filters;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Windows;

namespace BowlingWeb.Models
{
    public class MemberService
    {
        private IMemberRepository _memberRepository;

        public MemberService()
        {
            //_memberRepository = new MemberTxtRepository();
            _memberRepository = new MemberRepository();
        }

        public Member Login(Member member)
        {
            var ret = _memberRepository.Login(member);
            return ret;
        }
        // 上傳檔案
        internal List<Member> Upload(HttpPostedFileBase[] files)
        {
            var ret = _memberRepository.Upload(files);
            return ret;
        }
        // 讀取檔案
        internal List<Member> ReadExcel(string filePath)
        {
            var ret = _memberRepository.ReadExcel(filePath);
            return ret;
        }
        // 個人紀錄
        public Member GetMember(string account)
        {
            var ret = _memberRepository.GetMember(account);
            return ret;
        }

        public List<Member> GetAllMember()
        {
            var members = _memberRepository.GetAll();
            return members;
        }

        public Member CreateMember(Member member)
        {
            var ret = _memberRepository.Create(member);
            return ret;
        }

        public void Dispose()
        {
            _memberRepository.Dispose();
        }
    }
}
