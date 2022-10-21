using System.Collections.Generic;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        List<Member> GetAll();
        void Dispose();
    }
}
