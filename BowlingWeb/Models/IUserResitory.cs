using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public interface IUserRepository
    {
        User Get(string UserId);
        List<User> GetAll();
        void Dispose();
    }
}
