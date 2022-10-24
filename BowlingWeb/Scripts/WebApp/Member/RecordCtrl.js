var app = angular.module('app', ['ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('UsersRecord', {
            url: '/UsersRecord',
            templateUrl: 'Member/UsersRecord'
        })

});

app.run(['$http', '$window', function ($http, $window) {

    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();

}]);

app.service('appService', ['$http', function ($http) {

    // 取得所有成員
    this.GetAllMember = function (o) {
        return $http.post("Member/GetAllMember", o);
    };

}]);

app.controller('RecordCtrl', ['$scope', '$location', 'appService', '$rootScope', function ($scope, $location, appService, $rootScope) {

    // 移至成員選項
    $location.path('/UsersRecord');

}]);

app.controller('UsersRecordCtrl', ['$scope', '$window', 'appService', function ($scope, $window, appService) {

    $scope.Member = [];

    // 取得所有成員
    appService.GetAllMember({})
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });
}]);