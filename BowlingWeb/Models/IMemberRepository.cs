using System.Collections.Generic;
using System.Web;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        Member Login(Member member);
        List<Member> ReadData(IEnumerable<HttpPostedFileBase> excelFile, string callback);
        Member GetMember(string account);
        Member Create(Member member);
        List<Member> GetAll();
        void Dispose();
    }
}
