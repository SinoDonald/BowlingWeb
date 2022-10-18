using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace BowlingWeb.Models
{
    public class SelfAssessmentTxtRepository : IMemberRepository
    {
        private string _appData = "";

        public SelfAssessmentTxtRepository()
        {
            _appData = HttpContext.Current.Server.MapPath("~/App_Data");
        }

        public Member Get(int Id)
        {
            string fn = Path.Combine(_appData, Id.ToString() + "SelfAssessments.txt");
            string[] fileText = File.ReadAllLines(fn);
            Member selfAssessment = new Member();

            selfAssessment.Id = Convert.ToInt32(fileText[0]);
            selfAssessment.CategoryId = Convert.ToInt32(fileText[1]);
            selfAssessment.Content = fileText[2];
            return selfAssessment;
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
                selfAssessment.CategoryId = Convert.ToInt32(subs[1]);
                selfAssessment.Content = subs[2];
                selfAssessments.Add(selfAssessment);
            }

            selfAssessments = selfAssessments.OrderBy(a => a.CategoryId).ThenBy(a => a.Id).ToList();

            return selfAssessments;
        }

        public void Dispose()
        {
            return;
        }

        public bool Update(List<Member> assessments, string user)
        {
            string fn = Path.Combine(_appData, $"Response/{user}.txt");

            bool ret = false;
            try
            {
                List<string> responses = new List<string>();

                foreach (var item in assessments)
                {
                    responses.Add($"{item.Id}/{item.CategoryId}/{item.Content}/{item.Choice}");
                }

                System.IO.File.WriteAllLines(fn, responses);
                ret = true;
            }
            catch (Exception)
            {
                ret = false;
            }
            return ret;
        }

        public List<Member> GetResponse(string user)
        {
            List<Member> selfResponse = new List<Member>();
            try
            {
                string fn = Path.Combine(_appData, $"Response/{user}.txt");
                string[] lines = System.IO.File.ReadAllLines(fn);
                foreach (var item in lines)
                {
                    string[] subs = item.Split('/');
                    Member selfAssessment = new Member();

                    selfAssessment.Id = Convert.ToInt32(subs[0]);
                    selfAssessment.CategoryId = Convert.ToInt32(subs[1]);
                    selfAssessment.Content = subs[2];
                    selfAssessment.Choice = subs[3];
                    selfResponse.Add(selfAssessment);
                }

                selfResponse = selfResponse.OrderBy(a => a.CategoryId).ThenBy(a => a.Id).ToList();
            }
            catch (System.IO.FileNotFoundException)
            {

            }
            catch
            {

            }

            return selfResponse;
        }
        public List<Member> GetResponse(string user, string state, string year)
        {
            List<Member> selfResponse = new List<Member>();

            try
            {
                string fn = Path.Combine(_appData, $"Response/{year}/{state}/{user}.txt");
                string[] lines = System.IO.File.ReadAllLines(fn);
                foreach (var item in lines)
                {
                    string[] subs = item.Split('/');
                    Member selfAssessment = new Member();

                    selfAssessment.Id = Convert.ToInt32(subs[0]);
                    selfAssessment.CategoryId = Convert.ToInt32(subs[1]);
                    selfAssessment.Content = subs[2];
                    selfAssessment.Choice = subs[3];
                    selfResponse.Add(selfAssessment);
                }

                selfResponse = selfResponse.OrderBy(a => a.CategoryId).ThenBy(a => a.Id).ToList();
            }
            catch (System.IO.FileNotFoundException)
            {

            }
            catch
            {

            }
            finally
            {

            }

            return selfResponse;
        }

        public List<Member> GetResponse(string user, string year)
        {
            List<Member> selfResponse = new List<Member>();

            try
            {
                string fn = Path.Combine(_appData, $"Response/{year}/{user}.txt");
                string[] lines = System.IO.File.ReadAllLines(fn);

                for (int i = 1; i != lines.Length; i++)
                {
                    string[] subs = lines[i].Split('/');

                    Member selfAssessment = new Member();

                    selfAssessment.Id = Convert.ToInt32(subs[0]);
                    selfAssessment.CategoryId = Convert.ToInt32(subs[1]);
                    selfAssessment.Content = subs[2];

                    //When reading back in the file, you will need to unescape each line.
                    string unescapedValue = subs[3].Replace("\\n", "\n");
                    selfAssessment.Choice = unescapedValue;
                    //selfAssessment.Choice = subs[3];

                    selfResponse.Add(selfAssessment);
                }

                selfResponse = selfResponse.OrderBy(a => a.CategoryId).ThenBy(a => a.Id).ToList();
            }
            catch
            {

            }

            return selfResponse;
        }
        public string GetStateOfResponse(string user, string year)
        {
            List<Member> selfResponse = new List<Member>();
            string state = "";

            try
            {
                string fn = Path.Combine(_appData, $"Response/{year}/{user}.txt");

                string line = File.ReadLines(fn).FirstOrDefault();

                if (line != "")
                    state = line.Split(';')[0];

            }
            catch
            {

            }

            return state;
        }
        //deprecated
        public List<Member> GetAllResponses()
        {
            string fn = Path.Combine(_appData, "Response");

            var responseList = System.IO.Directory.GetFiles(fn, "*.txt").OrderBy(p =>
           System.IO.Path.GetFileName(p)).ToList();

            List<Member> allResponses = new List<Member>();

            foreach (var response in responseList)
            {

                string[] lines = System.IO.File.ReadAllLines(response);

                foreach (var item in lines)
                {
                    string[] subs = item.Split('/');
                    Member selfAssessment = new Member();

                    selfAssessment.Id = Convert.ToInt32(subs[0]);
                    selfAssessment.CategoryId = Convert.ToInt32(subs[1]);
                    selfAssessment.Content = subs[2];
                    selfAssessment.Choice = subs[3];
                    allResponses.Add(selfAssessment);
                }

            }
            return allResponses;
        }
        public bool UpdateMResponse(List<Member> assessments, string empId, string userId)
        {
            string fn = Path.Combine(_appData, $"Response/MResponse/{empId}_{userId}.txt");

            bool ret = false;
            try
            {
                List<string> responses = new List<string>();

                foreach (var item in assessments)
                {
                    responses.Add($"{item.Id}/{item.CategoryId}/{item.Content}/{item.Choice}");
                }

                System.IO.File.WriteAllLines(fn, responses);
                ret = true;
            }
            catch (Exception)
            {
                ret = false;
            }
            return ret;
        }
        public List<Member> GetMResponse(string empId, string userId)
        {
            List<Member> selfResponse = new List<Member>();
            try
            {
                string fn = Path.Combine(_appData, $"Response/MResponse/{empId}_{userId}.txt");
                string[] lines = System.IO.File.ReadAllLines(fn);
                foreach (var item in lines)
                {
                    string[] subs = item.Split('/');
                    Member selfAssessment = new Member();

                    selfAssessment.Id = Convert.ToInt32(subs[0]);
                    selfAssessment.CategoryId = Convert.ToInt32(subs[1]);
                    selfAssessment.Content = subs[2];
                    selfAssessment.Choice = subs[3];
                    selfResponse.Add(selfAssessment);
                }

                selfResponse = selfResponse.OrderBy(a => a.CategoryId).ThenBy(a => a.Id).ToList();
            }
            catch (System.IO.FileNotFoundException)
            {

            }
            catch
            {

            }

            return selfResponse;
        }

        public List<string> GetYearList(string userId)
        {
            List<string> years = new List<string>();

            string dn = Path.Combine(_appData, "Response");
            var dirs = System.IO.Directory.GetDirectories(dn);

            foreach (var dir in dirs)
            {
                if (File.Exists(Path.Combine(dn, $"{dir}/{userId}.txt")))
                {
                    years.Add((new DirectoryInfo(dir)).Name);
                }
            }

            if (!years.Contains(Utilities.DayStr()))
            {
                years.Add(Utilities.DayStr());
            }

            return years.OrderByDescending(a => a).ToList();
        }

        public List<string> GetChartYearList()
        {
            List<string> years = new List<string>();
            //string dn = Path.Combine(_appData, isManagerResponse ? "ManageResponse" : "Response");
            string dn = Path.Combine(_appData, "Response");
            var dirs = System.IO.Directory.GetDirectories(dn);

            foreach (var dir in dirs)
                years.Add((new DirectoryInfo(dir)).Name);

            return years.OrderByDescending(x => x).ToList();
        }
        // update the state in the first line
        public bool Update(List<Member> assessments, string user, string state, string year, DateTime time)
        {
            string fn = Path.Combine(_appData, $"Response/{year}/{user}.txt");

            bool ret = false;
            try
            {

                List<string> responses = new List<string>();

                responses.Add($"{state};{time}");

                foreach (var item in assessments)
                {
                    // 0912: escaped break line \n
                    string original = $"{item.Id}/{item.CategoryId}/{item.Content}/{item.Choice}";
                    string escapedValue = original.Replace("\n", "\\n");

                    //responses.Add($"{item.Id}/{item.CategoryId}/{item.Content}/{item.Choice}");
                    responses.Add(escapedValue);
                }


                (new FileInfo(fn)).Directory.Create();
                System.IO.File.WriteAllLines(fn, responses);
                ret = true;

            }
            catch (Exception)
            {
                ret = false;
            }
            return ret;
        }

        public (string, List<string>) GetFeedback(string empno, string manno, string name)
        {

            string state = "";
            List<string> feedbacks = new List<string>();

            try
            {
                string fn = Path.Combine(_appData, $"Feedback/{Utilities.DayStr()}/{empno}.txt");

                foreach (var line in File.ReadLines(fn))
                {
                    if (line.Contains($"{name}\t{manno}"))
                    {
                        string[] subs = line.Split('\t');

                        state = subs[2];


                        //When reading back in the file, you will need to unescape each line.                                                
                        for (int i = 3; i < subs.Length; i++)
                        {
                            string unescapedValue = subs[i].Replace("\\n", "\n");
                            feedbacks.Add(unescapedValue);
                        }


                        break;
                    }
                }

            }
            catch
            {

            }

            return (state, feedbacks);
        }

        public List<(string, List<string>)> GetAllFeedbacks(string empno, string year)
        {
            List<(string, List<string>)> nameWithFeedbacks = new List<(string, List<string>)>();

            try
            {
                string fn = Path.Combine(_appData, $"Feedback/{year}/{empno}.txt");
                string[] lines = System.IO.File.ReadAllLines(fn);

                foreach (var item in lines)
                {
                    string[] subs = item.Split('\t');

                    if (subs[2] == "submit")
                    {
                        string name = subs[0];
                        List<string> feedbacks = new List<string>();


                        //When reading back in the file, you will need to unescape each line.                                                
                        for (int i = 3; i < subs.Length; i++)
                        {
                            string unescapedValue = subs[i].Replace("\\n", "\n");
                            feedbacks.Add(unescapedValue);
                        }

                        //for (int i = 3; i < subs.Length; i++)
                        //    feedbacks.Add(subs[i]);

                        nameWithFeedbacks.Add((name, feedbacks));
                    }

                }
            }
            catch
            {

            }

            return nameWithFeedbacks;
        }

        public bool UpdateFeedback(List<string> feedbacks, string state, string empno, string manno, string name)
        {
            string fn = Path.Combine(_appData, $"Feedback/{Utilities.DayStr()}/{empno}.txt");

            bool ret = false;
            try
            {
                string feedbackText = $"{name}\t{manno}\t{state}";

                // 0912: escaped break line \n            
                foreach (var s in feedbacks)
                {
                    string escapedValue = s.Replace("\n", "\\n");
                    feedbackText += $"\t{escapedValue}";
                }


                if (!File.Exists(fn))
                {
                    // create the file directory if not exist
                    (new FileInfo(fn)).Directory.Create();
                    System.IO.File.WriteAllLines(fn, new string[] { feedbackText });
                }
                else
                {
                    var lines = File.ReadAllLines(fn).ToList();
                    bool isExist = false;


                    for (int i = 0; i != lines.Count; i++)
                    {
                        if (lines[i].Contains($"{name}\t{manno}"))
                        {
                            lines[i] = feedbackText;
                            isExist = true;
                        }
                    }

                    if (!isExist)
                        lines.Add(feedbackText);

                    System.IO.File.WriteAllLines(fn, lines);

                }

                ret = true;
            }
            catch (Exception)
            {
                ret = false;
            }
            return ret;
        }

        public bool Update(List<Member> assessments, string state, string year, string empno, string user)
        {
            throw new NotImplementedException();
        }
    }
}
