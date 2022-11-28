using ClosedXML.Excel;
using Dapper;
using Microsoft.Office.Interop.Excel;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Web;

namespace BowlingWeb.Models
{
    public class MemberRepository : IMemberRepository, IDisposable
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
        // 上傳檔案
        public List<Member> Upload(HttpPostedFileBase file)
        {
            List<Member> memberList = new List<Member>();
            try
            {
                // 儲存檔案
                if (file != null)
                {
                    if (file.ContentLength > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        var path = Path.Combine(HttpContext.Current.Server.MapPath("~/FileUploads"), fileName);
                        file.SaveAs(path);
                    }
                }

                //if (files == null || files.First() == null) throw new ApplicationException("未選取檔案或檔案上傳失敗");
                //if (files.Count() != 1) throw new ApplicationException("請上傳單一檔案");
                //var file = files.First();
                if (Path.GetExtension(file.FileName) != ".xlsx") throw new ApplicationException("請使用Excel 2007(.xlsx)格式");
                var stream = file.InputStream;
                XLWorkbook wb = new XLWorkbook(stream);
                if (wb.Worksheets.Count > 1)
                {
                    throw new ApplicationException("Excel檔包含多個工作表");
                }
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
                for (int i = 3; i <= columnCount; i++)
                {
                    Member member = new Member();
                    member.Account = table.Cell(1, i).Value.ToString();
                    string date = string.Empty;
                    string scores = string.Empty;
                    for (int j = 2; j < rowCount; j++)
                    {
                        // 讀取日期
                        if (table.Cell(j, 2).Value.ToString() != "")
                        {
                            DateTime dateTime = Convert.ToDateTime(table.Cell(j, 2).Value.ToString());
                            date = dateTime.ToString("yyyy/MM/dd");
                        }
                        // 先確認有分數, 才紀錄
                        if (table.Cell(j, i).Value.ToString() != "-")
                        {
                            if (table.Cell(j, 2).Value.ToString() != "")
                            {
                                if(scores.Length > 0)
                                {
                                    scores = scores.Remove(scores.Length - 1, 1) + ";";
                                }
                                scores += date + ":";
                            }
                            else
                            {
                                // 搜尋scores裡是否已記錄了這個日期
                                if(!scores.Contains(date + ":"))
                                {
                                    scores = scores.Remove(scores.Length - 1, 1) + ";";
                                    scores += date + ":";
                                }
                            }
                            if(table.Cell(j, i).Value.ToString() != "")
                            {
                                // 讀取scores目前最後紀錄的日期
                                scores += table.Cell(j, i).Value.ToString() + ",";
                            }
                        }
                    }
                    scores = scores.Remove(scores.Length - 1, 1) + ";";

                    member.Scores = scores;
                    memberList.Add(member);
                }

                EditToSQL(memberList); // 將List<Member>儲存到SQL
            }
            catch (Exception)
            {
                //return Content($"<script>alert({JsonConvert.SerializeObject(ex.Message)})</script>", "text/html");
            }

            return memberList;
        }
        // 更新SQL分數
        private void EditToSQL(List<Member> memberList)
        {
            Member ret;
            foreach(Member member in memberList)
            {
                // 將Excel資料儲存到SQL
                //string sql = @"INSERT INTO Member VALUES (@Account, @Password, @Group, @Name, @Email, @Skill, @Scores)";
                // 更新SQL分數
                string sql = "UPDATE Member SET Scores = @Scores WHERE Account=@Account";
                ret = conn.Query<Member>(sql, member).ToList().SingleOrDefault();
            }
        }
        // 上傳檔案資訊
        public Dictionary<string, object> UpdateFileInfo(HttpPostedFileBase file)
        {
            if (file != null)
            {
                if (file.ContentLength > 0)
                {
                    var fileName = Path.GetFileName(file.FileName);
                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/FileUploads"), fileName);
                    file.SaveAs(path);
                }
            }

            Dictionary<string, object> ret = new Dictionary<string, object>();

            if (file == null)
            {
                ret.Add("success", false);
                ret.Add("message", "file upload error.");
            }
            else
            {
                if (file.ContentLength > 0 && file.ContentLength < (1 * 1024 * 1024))
                {
                    var fileName = Path.GetFileName(file.FileName);
                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/FileUploads"), fileName);
                    file.SaveAs(path);

                    ret.Add("success", true);
                    ret.Add("message", file.FileName);
                    ret.Add("ContentLenght", file.ContentLength);
                }
                else
                {
                    if (file.ContentLength <= 0)
                    {
                        ret.Add("success", false);
                        ret.Add("message", "請上傳正確的檔案.");
                    }
                    else if (file.ContentLength > (1 * 1024 * 1024))
                    {
                        ret.Add("success", false);
                        ret.Add("message", "上傳檔案大小不可超過 1MB.");
                    }
                }
            }

            return ret;
        }
        // 讀取檔案
        public List<Member> ReadExcel(string filePath)
        {
            List<Member> memberList = new List<Member>();
            
            // 檔案路徑
            filePath = Path.Combine(HttpContext.Current.Server.MapPath("~/App_Data"), $"Data.xlsx");
            Application app = new Application();
            Sheets sheets;
            object oMissiong = System.Reflection.Missing.Value;
            Workbook workbook = app.Workbooks.Open(filePath, oMissiong, oMissiong);
            System.Data.DataTable dt = new System.Data.DataTable();
            try
            {
                if (app == null) return null;
                workbook = app.Workbooks.Open(filePath, oMissiong, oMissiong);
                sheets = workbook.Worksheets;
                //將資料讀入到DataTable中
                Worksheet worksheet = (Worksheet)sheets.get_Item(1);//請取第一張表
                if (worksheet == null) return null;
                int rowCount = worksheet.UsedRange.Rows.Count;
                int columnCount = worksheet.UsedRange.Columns.Count;

                for (int i = 3; i <= columnCount; i++)
                {
                    Member member = new Member();
                    member.Name = worksheet.Cells[1, i].Value.ToString();
                    string date = string.Empty;
                    string scores = string.Empty;
                    for (int j = 2; j < rowCount; j++)
                    {
                        // 讀取日期
                        bool dateValue = false;
                        try
                        {
                            if (worksheet.Cells[j, 2].Value.ToString() != "")
                            {
                                dateValue = true;
                                DateTime dateTime = Convert.ToDateTime(worksheet.Cells[j, 2].Value.ToString());
                                date = dateTime.ToString("yyyy/MM/dd");
                            }
                        }
                        catch(Exception ex)
                        {
                            dateValue = false;
                            string error = ex.Message + "\n" + ex.ToString();
                        }
                        // 先確認有分數, 才紀錄
                        if (worksheet.Cells[j, i].Value.ToString() != "-")
                        {
                            if (dateValue == true)
                            {
                                if (scores.Length > 0)
                                {
                                    scores = scores.Remove(scores.Length - 1, 1) + ";";
                                }
                                scores += date + ":";
                            }
                            else
                            {
                                // 搜尋scores裡是否已記錄了這個日期
                                if (!scores.Contains(date + ":"))
                                {
                                    scores = scores.Remove(scores.Length - 1, 1) + ";";
                                    scores += date + ":";
                                }
                            }
                            if (worksheet.Cells[j, i].Value.ToString() != "")
                            {
                                // 讀取scores目前最後紀錄的日期
                                scores += worksheet.Cells[j, i].Value.ToString() + ",";
                            }
                        }
                    }
                    scores = scores.Remove(scores.Length - 1, 1) + ";";

                    member.Scores = scores;
                    memberList.Add(member);
                }
            }
            catch
            {
                //return null;
            }
            //finally
            //{
            //    workbook.Close(false, oMissiong);
            //    System.Runtime.InteropServices.Marshal.ReleaseComObject(workbook);
            //    workbook = null;
            //    app.Workbooks.Close();
            //    app.Quit();
            //    System.Runtime.InteropServices.Marshal.ReleaseComObject(app);
            //    app = null;
            //}

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
                string[] dateScoreList = member.Scores.Split(';');
                foreach(string item in dateScoreList)
                {
                    try
                    {
                        DateScores dateScores = new DateScores();
                        string dateScore = item.Split(':')[1];
                        dateScores.Date = item.Split(':')[0];
                        string[] scores = dateScore.Split(',');
                        foreach (string score in scores)
                        {
                            dateScores.Scores.Add(Convert.ToDouble(score));
                        }
                        ret.DateScores.Add(dateScores);
                    }
                    catch(Exception ex)
                    {
                        string error = ex.Message;
                    }
                }
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