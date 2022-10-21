using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace BowlingWeb.Models
{
    public class MemberTxtRepository : IMemberRepository
    {
        private string _appData = "";

        public MemberTxtRepository()
        {
            _appData = HttpContext.Current.Server.MapPath("~/App_Data");
        }

        public List<Member> GetAll()
        {
            string fn = Path.Combine(_appData, "SelfAssessments.txt");
            string[] lines = System.IO.File.ReadAllLines(fn);
            List<Member> selfAssessments = new List<Member>();

            foreach (var item in lines)
            {
                string[] subs = item.Split('\t');
                Member selfAssessment = new Member();

                selfAssessment.Id = Convert.ToInt32(subs[0]);
                selfAssessments.Add(selfAssessment);
            }

            selfAssessments = selfAssessments.OrderBy(a => a.Id).ToList();

            return selfAssessments;
        }

        public void Dispose()
        {
            return;
        }
    }
}
