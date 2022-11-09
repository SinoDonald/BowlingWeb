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
    public class MemberTxtRepository : IMemberRepository
    {
        private string _appData = "";

        public MemberTxtRepository()
        {
            _appData = HttpContext.Current.Server.MapPath("~/App_Data");
        }

        public Member Login(Member member)
        {
            throw new NotImplementedException();
        }

        public Member Create(Member member)
        {
            throw new NotImplementedException();
        }

        public Member GetMember(string account)
        {
            throw new NotImplementedException();
        }
        // 讀取所有成員資訊
        public List<Member> GetAll()
        {
            List<Member> userInfo = new List<Member>();
            string dirPath = Path.Combine(_appData, $"Member");
            string[] dirs = Directory.GetDirectories(dirPath);
            foreach (string dir in dirs)
            {
                Member user = new Member();
                user.Name = Path.GetFileNameWithoutExtension(dir); // 成員名稱
                DirectoryInfo di = new DirectoryInfo(@dir);
                foreach (FileInfo skill in di.GetFiles())
                {
                    if (File.Exists(skill.FullName))
                    {
                        try
                        {
                            SkillScores skillScores = new SkillScores();
                            skillScores.Skill = Path.GetFileNameWithoutExtension(skill.Name);
                            foreach (string score in File.ReadAllLines(skill.FullName))
                            {
                                skillScores.Scores.Add(Convert.ToDouble(score));
                            }
                            user.SkillScores.Add(skillScores);
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show(ex.Message);
                        }
                    }
                }
                userInfo.Add(user);
            }

            userInfo = userInfo.OrderBy(a => a.Name).ToList();

            return userInfo;
        }

        public void Dispose()
        {
            return;
        }

        public List<Member> ReadData(IEnumerable<HttpPostedFileBase> excelFile, string callback)
        {
            throw new NotImplementedException();
        }
    }
}
