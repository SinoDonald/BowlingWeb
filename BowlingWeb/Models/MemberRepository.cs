using BowlingWeb.Models;
using ClosedXML.Excel;
using Dapper;
//using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Web;

namespace BowlingWeb.Filters
{
    internal class MemberRepository : IMemberRepository, IDisposable
    {
        private IDbTransaction Transaction { get; set; }
        private IDbConnection conn;
        public MemberRepository()
        {
            string memberConnection = ConfigurationManager.ConnectionStrings["MemberConnection"].ConnectionString;
            conn = new SQLiteConnection(memberConnection);
        }
        // 登入
        public Member Login(Member member)
        {
            Member ret;

            string sql = @"select * from Member where Account=@Account and Password=@Password";
            ret = conn.Query<Member>(sql, member).ToList().FirstOrDefault();

            return ret;
        }
        // 讀取資料
        public List<Member> ReadData(IEnumerable<HttpPostedFileBase> excelFile, string callback)
        {
            List<Member> memberList = new List<Member>();
            try
            {
                if (excelFile == null || excelFile.First() == null) throw new ApplicationException("未選取檔案或檔案上傳失敗");
                if (excelFile.Count() != 1) throw new ApplicationException("請上傳單一檔案");
                var file = excelFile.First();
                if (Path.GetExtension(file.FileName) != ".xlsx") throw new ApplicationException("請使用Excel 2007(.xlsx)格式");
                var stream = file.InputStream;
                XLWorkbook wb = new XLWorkbook(stream);
                if (wb.Worksheets.Count > 1)
                {
                    throw new ApplicationException("Excel檔包含多個工作表");
                }
                var csv =
                    string.Join("\n",
                        wb.Worksheets.First().RowsUsed().Select(row =>
                            string.Join("\t",
                                row.Cells(1, row.LastCellUsed(false).Address.ColumnNumber)
                                .Select(cell => cell.GetValue<string>()).ToArray()
                            )).ToArray());
                //return Content($@"<script>{callback}({JsonConvert.SerializeObject(csv)});</script>", "text/html");

                // 讀取第一個 Sheet
                IXLWorksheet worksheet = wb.Worksheets.Worksheet(1);
                // 定義資料起始/結束 Cell
                var firstCell = worksheet.FirstCellUsed();
                var lastCell = worksheet.LastCellUsed();
                // 使用資料起始/結束 Cell，來定義出一個資料範圍
                var data = worksheet.Range(firstCell.Address, lastCell.Address);
                // 將資料範圍轉型
                var table = data.AsTable();
                //讀取資料
                int columnCount = worksheet.Columns().Count();
                int rowCount = worksheet.Rows().Count();
                for(int i = 3; i < columnCount; i++)
                {
                    Member member = new Member();
                    member.Name = table.Cell(1, i).Value.ToString();
                    string date = string.Empty;
                    string scores = string.Empty;
                    for (int j = 2; j < rowCount; j++)
                    {
                        if (table.Cell(j, 2).Value.ToString() != "")
                        {
                            DateTime dateTime = Convert.ToDateTime(table.Cell(j, 2).Value.ToString());
                            date = dateTime.ToString("yyyy/MM/dd");
                            scores += date + ":";
                        }
                        scores += table.Cell(j, i).Value.ToString() + ",";
                    }
                    member.Scores = scores;
                    memberList.Add(member);
                }

                return memberList;
            }
            catch (Exception)
            {
                //return Content($"<script>alert({JsonConvert.SerializeObject(ex.Message)})</script>", "text/html");
            }

            Member member1 = new Member();
            member1.Name = "TEST";
            memberList.Add(member1);

            return memberList;
        }
        // 個人紀錄
        public Member GetMember(string account)
        {
            Member ret;

            string sql = @"select * from Member where Account=@account";
            List<Member> members = conn.Query<Member>(sql, new { account }).ToList();
            ret = conn.Query<Member>(sql, new { account }).ToList().FirstOrDefault();
            foreach (Member member in members)
            {
                SkillScores skillScores = new SkillScores();
                skillScores.Skill = member.Skill;
                string[] scores = member.Scores.Split(',');
                foreach(string score in scores)
                {
                    skillScores.Scores.Add(Convert.ToDouble(score));
                }
                ret.SkillScores.Add(skillScores);
            }

            return ret;
        }

        public List<Member> GetAll()
        {
            List<Member> ret;

            string sql = @"select * from Member where Name != 'NULL' order by Name";
            ret = conn.Query<Member>(sql).ToList();

            return ret;
        }
        // 註冊
        public Member Create(Member member)
        {
            Member ret;

            string sql = @"INSERT INTO Member VALUES (@Account, @Password, @Name, @Name, @Email, @Email, @Email)";
            ret = conn.Query<Member>(sql, member).ToList().SingleOrDefault();

            return ret;
        }
        public List<Member> GetMember()
        {
            List<Member> ret;
            string sql = @"select * from user where duty != 'NULL' order by dutyName";
            ret = conn.Query<Member>(sql).ToList();

            return ret;
        }
        public void Dispose()
        {
            conn.Close();
            conn.Dispose();
            return;
        }
    }
}