using System.Collections.Generic;

namespace BowlingWeb.Models
{
    public interface IMemberRepository
    {
        Member Login(Member member);
        Member GetMember(string account);
        Member Create(Member member);
        List<Member> GetAll();
        void Dispose();
    }
}
