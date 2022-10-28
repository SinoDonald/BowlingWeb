using System.Collections.Generic;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        Member Get(string Account);
        Member Create(Member member);
        List<Member> GetAll();
        void Dispose();
    }
}
