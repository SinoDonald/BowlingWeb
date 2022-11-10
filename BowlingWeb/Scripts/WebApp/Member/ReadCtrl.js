var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得個人紀錄
    this.ReadData = function (o) {
        return $http.post("Member/ReadData", o);
    };

}]);

app.controller('ReadCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    $scope.Member = [];

    //// 讀取資料
    //appService.ReadData({})
    //    .then(function (ret) {
    //        $scope.Member = ret.data;
    //    })
    //    .catch(function (ret) {
    //        alert('Error');
    //    });

    // 讀取資料
    $scope.ReadData = function () {
        appService.ReadData({ excelFile: $scope.data, callback: $scope.data })
            .then(function (ret) {
                $scope.Member = ret.data;
            })
            .catch(function (ret) {
                alert('Error');
            });
    }
    $scope.ReadData();

}]);