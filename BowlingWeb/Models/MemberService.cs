using BowlingWeb.Filters;
using Microsoft.Ajax.Utilities;
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

        public Member Login(Member member)
        {
            var ret = _memberRepository.Login(member);
            return ret;
        }
        // 讀取資料
        public Member ReadData()
        {
            var ret = _memberRepository.ReadData();
            return ret;
        }
        // 個人紀錄
        public Member GetMember(string account)
        {
            var ret = _memberRepository.GetMember(account);
            return ret;
        }

        public List<Member> GetAllMember()
        {
            var members = _memberRepository.GetAll();
            return members;
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
