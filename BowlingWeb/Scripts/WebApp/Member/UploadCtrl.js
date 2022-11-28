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

}]);

app.controller('UploadCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 儲存檔案或寄送
    $scope.Upload = function (ret) {
        appService.Upload()
            .then(function (ret) {
                $scope.ReadExcel = ret.data;
                $window.location.href = 'Home/Index';
            });
    };

    // 讀取Excel
    $scope.ReadExcel = function () {
        appService.ReadExcel({})
            .then(function (ret) {
                $scope.ReadExcel = ret.data;
            })
            .catch(function (ret) {
                alert('Error');
            });
    };

    // 開啟關閉上傳按鈕
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

    // 檔案上傳成功或失敗訊息
    $(function () {
        $("#UploadForm").ajaxForm({
            iframe: true,
            dataType: "json",
            success: function (result) {
                $scope.ReadExcel = result;
                $("#UploadForm").resetForm();
                if (result.success) {
                    toastr.success(result.message, 'Success Message')
                }
                else {
                    toastr.error(result.message, 'Error Message')
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#UploadForm").resetForm();
                toastr.error('檔案上傳錯誤.', 'Error Message')
            }
        });
    });

}]);