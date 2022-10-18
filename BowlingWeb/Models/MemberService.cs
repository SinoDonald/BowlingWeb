using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BowlingWeb.Models
{
    public class MemberService
    {
        private IMemberRepository _assessmentRepository;
        private IUserRepository _userRepository;

        public MemberService()
        {
            _assessmentRepository = new SelfAssessmentTxtRepository();
            _userRepository = new UserRepository();
        }

        public List<Member> GetAllSelfAssessments()
        {
            var selfAssessments = _assessmentRepository.GetAll();
            return selfAssessments;
        }

        public bool UpdateResponse(List<Member> assessments, string user, string state, string year)
        {
            return (_assessmentRepository as SelfAssessmentTxtRepository).Update(assessments, user, state, year, DateTime.Now);
        }

        public SelfAssessResponse GetSelfAssessmentResponse(string user, string year = "")
        {
            if (String.IsNullOrEmpty(year))
                year = Utilities.DayStr();

            string state = (_assessmentRepository as SelfAssessmentTxtRepository).GetStateOfResponse(user, year);
            var selfAssessmentResponse = (_assessmentRepository as SelfAssessmentTxtRepository).GetResponse(user, year);

            return new SelfAssessResponse() { Responses = selfAssessmentResponse, State = state };
        }

        public List<Member> GetSelfAssessmentMResponse(string empId, string user)
        {
            var selfAssessmentMResponse = (_assessmentRepository as SelfAssessmentTxtRepository).GetMResponse(empId, user);
            return selfAssessmentMResponse;
        }

        public class SelfAssessResponse
        {
            public string State { get; set; }
            public List<Member> Responses { get; set; }
        }
    }
}
