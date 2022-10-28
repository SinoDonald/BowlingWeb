using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public class SkillScores
    {
        public string Skill { get; set; }
        public List<double> Scores = new List<double>();
    }
    public class Member
    {
        public string Account { get; set; }
        public string Name { get; set; }
        public string Email { get;set; }
        public string Password { get; set; }
        public List<SkillScores> SkillScores = new List<SkillScores>();
    }
}
