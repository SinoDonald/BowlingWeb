var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

}]);

app.controller('DownloadCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    var myHeading = document.querySelector('h1');
    myHeading.textContent = 'Hello world!';

    // 開啟關閉上傳按鈕
    $(document).ready(function () {
        $('#files').change(function () {

            if ($('#files')[0].files.length > 0) {
                $('#downloadBtn').removeAttr('disabled');
            }
            else {
                $('#downloadBtn').attr('disabled', true)
            }
        })
    })

    // 檔案上傳成功或失敗訊息
    $(function () {
        $("#DownloadForm").ajaxForm({
            iframe: true,
            dataType: "json",
            success: function (result) {
                $scope.ReadExcel = result;
                $("#DownloadForm").resetForm();
                if (result.success) {
                    toastr.success(result.message, 'Success Message')
                }
                else {
                    toastr.error(result.message, 'Error Message')
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#DownloadForm").resetForm();
                toastr.error('檔案上傳錯誤.', 'Error Message')
            }
        });
    });

}]);