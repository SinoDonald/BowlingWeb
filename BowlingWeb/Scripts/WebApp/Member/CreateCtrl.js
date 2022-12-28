var app = angular.module('app', ['ui.router', 'moment-picker']);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得所有成員
    this.GetUserGroup = function (o) {
        return $http.post('Member/GetUserGroup', o);
    };

}]);

// 儲存參數
app.factory('myFactory', function () {

    var member = {}

    function set(data) {
        member.Account = data.Account;
        member.Group = data.Group;
        member.Name = data.Name;
        member.Games = data.Games;
        member.MaxScore = data.MaxScore;
        member.MinScore = data.MinScore;
        member.AverageScore = data.AverageScore;
        member.DateScores = data.DateScores;
        member.StatisticsRow = data.StatisticsRow;
        member.StatisticsCol = data.StatisticsCol;
    }

    function get() {
        return member;
    }

    return {
        set: set,
        get: get,
    }

});

// 顯示成員名單
app.controller('CreateCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', 'myFactory', function ($scope, $window, appService, $rootScope, $location, myFactory) {

    // 取得所有成員名單
    appService.GetUserGroup({})
        .then(function (ret) {
            $scope.GetUserGroup = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

}]);