using System.Collections.Generic;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        Member Get(Member member);
        Member Create(Member member);
        List<Member> GetAll();
        void Dispose();
    }
}
