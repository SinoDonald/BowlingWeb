using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public class Member
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Content { get; set; }
        public int UserId { get; set; }
        public string Choice { get; set; }
        public string ManagerChoice { get; set; }
    }
}
