using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public class User
    {
        //public string UserId { get; set; }
        //public string UserName { get; set; }
        //public string Role { get; set; }

        public string userID { get; set; }
        public string userName { get; set; }
        public string userPwd { get; set; }
        public bool userEmail { get; set; }
        public string score { get; set; }
    }
}
