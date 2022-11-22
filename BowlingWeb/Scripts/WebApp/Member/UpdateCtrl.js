var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得個人紀錄
    this.GetMember = function (o) {
        return $http.post("Member/GetMember", o);
    };

    // 上傳檔案
    this.Upload = function (o) {
        return $http.post("Member/Upload", o);
    };

    // 讀取檔案
    this.ReadExcel = function (o) {
        return $http.post("Member/ReadExcel", o);
    };

    $(document).ready(function () {
        $('#files').change(function () {

            if ($('#files')[0].files.length > 0) {
                $('#uploadBtn').removeAttr('disabled');
            }
            else {
                $('#uploadBtn').attr('disabled', true)
            }
        })
    })

    const fileUploader = document.querySelector('#file-uploader');

    fileUploader.addEventListener('change', (e) => {
        console.log(e.target.files); // get file object
    });

    $('#upload').on('click', function () {
        var file_data = $('#blockimg').prop('files')[0];   //取得上傳檔案屬性
        var form_data = new FormData();  //建構new FormData()
        form_data.append('file', file_data);  //吧物件加到file後面

        $.ajax({
            url: 'upload.php',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,     //data只能指定單一物件                 
            type: 'post',
            success: function (data) {
                $('#ajsxboxdhow').html(data);
            }
        });
    });

}]);

app.controller('UpdateCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 儲存檔案或寄送
    $scope.Update = function () {
        appService.Upload()
            .then(function (ret) {
                $window.location.href = 'Home/Index';
            });
    };

    // 讀取Excel
    $scope.ReadExcel = function () {
        appService.ReadExcel()
            .then(function (ret) {
                $window.location.href = 'Home/Index';
            });
    };

}]);