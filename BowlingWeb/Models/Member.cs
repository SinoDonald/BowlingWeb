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
        public int Games { get; set; }
        public string MaxScore { get; set; }
        public string MinScore { get; set; }
        public string AverageScore { get; set; }        
        public List<DateScores> DateScores = new List<DateScores>();
    }

    //存檔完畢之後回傳結果的物件
    public class ModalFormSaveResultModel
    {
        public bool IsSuccess { get; set; } = false;
        public string ErrorMsg { get; set; } = string.Empty;
        public string InfoMsg { get; set; } = string.Empty;

    }

    //按下（存檔）按鈕時，post送出的資料
    public class AuditCorrectSavePostModel
    {
        public UploadFileDetailModel[] UploadFileDetailArr { get; set; }//多個檔案上傳

    }

    public class UploadFileDetailModel
    {
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FileContentBase64 { get; set; }

    }
}
