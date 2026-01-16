var app = angular.module('app');

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    this.CreateMember = function (o) {
        return $http.post("Member/CreateMember", o);
    };

}]);

app.controller('RegisterCtrl', ['$scope', '$window', 'appService', function ($scope, $window, appService) {

    // 儲存檔案或寄送
    $scope.CreateMember = function () {
        appService.CreateMember($scope.Member)
            .then(function (ret) {
                $window.location.href = 'Home/Index';
            });
    };
}]);