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

}]);

app.controller('UpdateCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 儲存檔案或寄送
    $scope.Update = function () {
        appService.Upload($scope.files)
            .then(function (ret) {
                $window.location.href = 'Home/Index';
            });
    };

    //$scope.Member = [];

    //// 取得個人紀錄
    //appService.GetMember({})
    //    .then(function (ret) {
    //        $scope.Member = ret.data;
    //    })
    //    .catch(function (ret) {
    //        alert('Error');
    //    });

}]);