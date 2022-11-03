var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得登入帳號
    this.Login = function (o) {
        return $http.post("Member/Login", o);
    };

}]);

app.controller('LoginCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 登入
    $scope.Login = function () {
        appService.Login($scope.Member)
            .then(function (ret) {
                $window.location.href = 'Home/Index';
                //$window.location.href = 'Member/Record';
            });
    };

    //// 移至成員選項
    //$location.path('/Record');

}]);