var app = angular.module('app', ['ngAnimate']);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    this.CreateUser = function (o) {
        return $http.post("Member/CreateBook", o);
    };

}]);

app.controller('RegisterCtrl', ['$scope', '$window', 'appService', function ($scope, $window, appService) {

    $scope.CreateUser = function () {
        appService.CreateUser($scope.Book).then(function (ret) {
            $window.location.href = '/Book1/Index';
        });
    }

}]);



