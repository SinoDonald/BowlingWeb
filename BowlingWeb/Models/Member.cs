using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace BowlingWeb.Models
{
    public class DateScores
    {
        public string Date { get; set; }
        public List<double> Scores = new List<double>();
    }
    public class Member
    {
        public string Account { get; set; }
        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,15}$")]
        public string Password { get; set; }
        public string Group { get; set; }
        public string Name { get; set; }
        [Required]
        [RegularExpression(@"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}")]
        public string Email { get;set; }
        public string Skill { get; set; }
        public string Scores { get; set; }
        public List<DateScores> DateScores = new List<DateScores>();
    }
    // 上傳檔案
    public class FiledUploaded
    {
        public FiledUploaded(HttpPostedFileBase file, string serverPath)
        {
            HashedName = System.Web.Helpers.Crypto.SHA256(file.FileName);
            FileName = file.FileName;
            FileSize = file.ContentLength;
            ServerPath = Path.Combine(serverPath + file.FileName);
            Extension = Path.GetExtension(file.FileName);
        }

        public string FileName { get; set; }
        public string HashedName { get; set; }
        public string ServerPath { get; set; }
        public int FileSize { get; set; }
        public string Extension { get; set; }
    }
    public class ReadExcel
    {
        [Required(ErrorMessage = "Please select file")]
        [FileExt(Allow = ".xls,.xlsx", ErrorMessage = "Only excel file")]
        public HttpPostedFileBase file { get; set; }
    }
    public class FileExt : ValidationAttribute
    {
        public string Allow;
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value != null)
            {
                string extension = ((System.Web.HttpPostedFileBase)value).FileName.Split('.')[1];
                if (Allow.Contains(extension))
                    return ValidationResult.Success;
                else
                    return new ValidationResult(ErrorMessage);
            }
            else
                return ValidationResult.Success;
        }
    }
}
