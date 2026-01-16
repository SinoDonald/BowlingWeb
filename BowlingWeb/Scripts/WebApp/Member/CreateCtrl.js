var app = angular.module('app');

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得所有成員
    this.GetUserGroup = function (o) {
        return $http.post('Member/GetUserGroup', o);
    };
    // 新增分數
    this.CreateScores = (o) => {
        return $http.post('Member/CreateScores', o);
    };

}]);

// 儲存參數
app.factory('myFactory', function () {

    var member = {}

    function set(data) {
        member.Account = data.Account;
        member.CreateScores = data.CreateScores;
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

    $scope.today = new Date(); // 預設當天日期

    // 取得所有成員名單
    appService.GetUserGroup({})
        .then(function (ret) {
            $scope.GetUserGroup = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    // 統計分數區間
    $scope.CreateScores = function (date, users) {
        // 沒有選擇日期時, 預設為當日
        if (date == undefined) {
            let y = $scope.today.getFullYear();
            let m = $scope.today.getUTCMonth() + 1;
            let d = $scope.today.getDate();
            date = y + '/' + m + '/' + d;
        }
        for (let i = 0; i !== users.length; i++) {
            users[i].SerializationScores = users[i].CreateScores
        }
        appService.CreateScores({ date: date, users: users })
            .then((ret) => {
                if (ret.data === "新增完成") {
                    alert(ret.data)
                    $window.location.href = 'Member/Record';
                }
                else {
                    alert(ret.data)
                }               
            })
            .catch((ret) => { alert('Error'); }
        );
    }

}]);