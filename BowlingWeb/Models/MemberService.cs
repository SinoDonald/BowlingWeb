using BowlingWeb.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public class MemberService
    {
        private IMemberRepository _memberRepository;

        public MemberService()
        {
            //_memberRepository = new MemberTxtRepository();
            _memberRepository = new MemberRepository();
        }

        public List<Member> GetAllMember()
        {
            var members = _memberRepository.GetAll();
            return members;
        }

        public Member GetMember(Member member)
        {
            var ret = _memberRepository.Get(member);
            return ret;
        }

        public Member CreateMember(Member member)
        {
            var ret = _memberRepository.Create(member);
            return ret;
        }

        public void Dispose()
        {
            _memberRepository.Dispose();
        }
    }
}
