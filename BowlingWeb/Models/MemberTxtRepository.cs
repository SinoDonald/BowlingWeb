using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
        // 個人紀錄
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
                            DateScores skillScores = new DateScores();
                            skillScores.Date = Path.GetFileNameWithoutExtension(skill.Name);
                            foreach (string score in File.ReadAllLines(skill.FullName))
                            {
                                skillScores.Scores.Add(Convert.ToDouble(score));
                            }
                            user.DateScores.Add(skillScores);
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
        // 上傳檔案資訊
        public Dictionary<string, object> UpdateFileInfo(HttpPostedFileBase file)
        {
            throw new NotImplementedException();
        }
        // 上傳單一檔案
        public List<Member> Upload(HttpPostedFileBase file)
        {
            throw new NotImplementedException();
        }
        // 讀取檔案
        public List<Member> ReadExcel(string filePath)
        {
            throw new NotImplementedException();
        }
        // 區間紀錄
        public List<DateScores> IntervalRecord(Member member, string startDate, string endDate)
        {
            throw new NotImplementedException();
        }
        public void Dispose()
        {
            return;
        }
    }
}
