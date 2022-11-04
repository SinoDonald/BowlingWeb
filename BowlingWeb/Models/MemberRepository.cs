using BowlingWeb.Models;
using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SQLite;
using System.Linq;

namespace BowlingWeb.Filters
{
    internal class MemberRepository : IMemberRepository, IDisposable
    {
        private IDbTransaction Transaction { get; set; }
        private IDbConnection conn;
        public MemberRepository()
        {
            string memberConnection = ConfigurationManager.ConnectionStrings["MemberConnection"].ConnectionString;
            conn = new SQLiteConnection(memberConnection);
        }
        // 登入
        public Member Login(Member member)
        {
            Member ret;

            string sql = @"select * from Member where Account=@Account and Password=@Password";
            ret = conn.Query<Member>(sql, member).ToList().FirstOrDefault();

            return ret;
        }
        // 個人紀錄
        public Member GetMember(string account)
        {
            Member ret;

            string sql = @"select * from Member where Account=@account";
            List<Member> members = conn.Query<Member>(sql, new { account }).ToList();
            ret = conn.Query<Member>(sql, new { account }).ToList().FirstOrDefault();
            foreach (Member member in members)
            {
                SkillScores skillScores = new SkillScores();
                skillScores.Skill = member.Skill;
                string[] scores = member.Scores.Split(',');
                foreach(string score in scores)
                {
                    skillScores.Scores.Add(Convert.ToDouble(score));
                }
                ret.SkillScores.Add(skillScores);
            }

            return ret;
        }

        public List<Member> GetAll()
        {
            List<Member> ret;

            string sql = @"select * from Member where Name != 'NULL' order by Name";
            ret = conn.Query<Member>(sql).ToList();

            return ret;
        }
        // 註冊
        public Member Create(Member member)
        {
            Member ret;

            string sql = @"INSERT INTO Member VALUES (@Account, @Password, @Name, @Name, @Email, @Email, @Email)";
            ret = conn.Query<Member>(sql, member).ToList().SingleOrDefault();

            return ret;
        }
        public List<Member> GetMember()
        {
            List<Member> ret;
            string sql = @"select * from user where duty != 'NULL' order by dutyName";
            ret = conn.Query<Member>(sql).ToList();

            return ret;
        }
        public void Dispose()
        {
            conn.Close();
            conn.Dispose();
            return;
        }
    }
}