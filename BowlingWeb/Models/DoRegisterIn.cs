using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public class DoRegisterIn
    {
        public string userID { get; set; }
        public string userPwd { get; set; }
        public string userName { get; set; }
        public string userEmail { get; set; }
    }
    public class DoRegisterOut
    {
        public string errMsg { get; set; }
        public string resultMsg { get; set; }
    }
}
