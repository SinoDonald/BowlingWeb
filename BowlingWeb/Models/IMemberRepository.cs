using System.Collections.Generic;
using System.Web;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        // 註冊
        Member Create(Member member);
        // 登入
        Member Login(Member member);
        Member GetMember(string account);
        List<Member> GetAll();
        // 上傳檔案資訊
        Dictionary<string, object> UpdateFileInfo(HttpPostedFileBase file);
        // 上傳單一檔案
        List<Member> Upload(HttpPostedFileBase file);
        // 讀取檔案
        List<Member> ReadExcel(string filePath);
        void Dispose();
    }
}
