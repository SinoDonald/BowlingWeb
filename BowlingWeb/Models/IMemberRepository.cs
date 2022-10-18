using System.Collections.Generic;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        List<Member> GetAll();
        bool Update(List<Member> assessments, string user);
        bool Update(List<Member> assessments, string state, string year, string empno, string user);
        List<Member> GetResponse(string user);
        List<Member> GetResponse(string year, string manager, string user);
        List<Member> GetAllResponses();
        List<string> GetChartYearList();
        void Dispose();
    }
}
