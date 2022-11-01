var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    this.GetMember = function (o) {
        return $http.post("Member/GetMember", o);
    };

}]);

app.controller('LoginCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 登入
    $scope.GetMember = function () {
        appService.GetMember($scope.Member)
            .then(function (ret) {
                $window.location.href = 'Home/Index';
            });
    };
}]);