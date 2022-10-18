﻿using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SQLite;
using System.Linq;

namespace BowlingWeb.Models
{
    public class UserRepository : IUserRepository, IDisposable
    {
        private IDbConnection conn;

        public UserRepository()
        {
            string userConnection = ConfigurationManager.ConnectionStrings["UserConnection"].ConnectionString;
            conn = new SQLiteConnection(userConnection);
        }

        public void Dispose()
        {
            conn.Close();
            conn.Dispose();
            return;
        }

        public List<User> GetAll()
        {
            List<User> ret;

            //string sql = @"select * from user order by empno";
            string sql = @"SELECT * FROM user AS u LEFT JOIN userExtra AS e ON u.empno = e.empno";
            ret = conn.Query<User>(sql).ToList();

            return ret;
        }
        public List<User> GetManagers()
        {
            List<User> ret;
            string sql = @"select * from user where duty != 'NULL' order by dutyName";
            ret = conn.Query<User>(sql).ToList();

            return ret;
        }
        public User Get(string id)
        {
            User ret;

            //string sql = @"select * from user where empno=@id";
            string sql = @"SELECT * FROM user AS u LEFT JOIN userExtra AS e ON u.empno = e.empno WHERE u.empno=@id";
            ret = conn.Query<User>(sql, new { id }).SingleOrDefault();

            return ret;
        }

    }
}
