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
            _memberRepository = new MemberTxtRepository();
        }

        public List<Member> GetAllMember()
        {
            var members = _memberRepository.GetAll();
            return members;
        }

        public void Dispose()
        {
            _memberRepository.Dispose();
        }
    }
}
