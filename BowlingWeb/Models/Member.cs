using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,15}$")]
        public string Password { get; set; }
        public string Group { get; set; }
        public string Name { get; set; }
        [Required]
        [RegularExpression(@"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}")]
        public string Email { get;set; }
        public List<SkillScores> SkillScores = new List<SkillScores>();
    }
}
