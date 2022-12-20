var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

}]);

app.controller('UploadCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // select year and month
    $scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    $scope.years = [];

    const date = new Date();
    const [month, year] = [date.getMonth(), date.getFullYear()];

    for (let i = year; i !== 2019; i--) {
        $scope.years.push(i.toString());
    }

    $scope.selectedYear = $scope.years[0];
    $scope.selectedMonth = $scope.months[month];


    $scope.data = [];

    $scope.ctrl = {};
    $scope.ctrl.datepicker = moment().add(-1, 'months').locale('zh-tw').format('YYYY-MM');

    $scope.propertyName = 'User.group_one';
    $scope.reverse = false;

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