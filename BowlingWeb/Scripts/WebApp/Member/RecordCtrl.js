var app = angular.module('app', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('AllMemberRecord', {
            url: '/AllMemberRecord',
            templateUrl: 'Member/AllMemberRecord'
        })
        .state('RecordOption', {
            url: '/RecordOption',
            templateUrl: 'Member/RecordOption'
        })
        .state('ChartRecord', {
            url: '/ChartRecord',
            templateUrl: 'Member/ChartRecord'
        })
        .state('PersonalRecord', {
            url: '/PersonalRecord',
            templateUrl: 'Member/PersonalRecord'
        })

}]);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得所有成員
    this.GetAllMember = function (o) {
        return $http.post('Member/GetAllMember', o);
    };

    // 統計圖表+個人紀錄
    this.GetMember = function (o) {
        return $http.post("Member/GetMember", o);
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
    }

    function get() {
        return member;
    }

    return {
        set: set,
        get: get,
    }

});

app.controller('RecordCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', function ($scope, $window, appService, $rootScope, $location) {

    $location.path('/AllMemberRecord');

}]);

app.controller('AllMemberRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', 'myFactory', function ($scope, $window, appService, $rootScope, $location, myFactory) {

    // 取得所有成員名單
    appService.GetAllMember({})
        .then(function (ret) {
            $scope.GetAllMember = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    // 選擇要看的成員
    $scope.RecordOption = function (data) {
        // 取得個人紀錄
        appService.GetMember({ account: data })
            .then(function (ret) {
                myFactory.set(ret.data)
                $location.path('/RecordOption');
            })
            .catch(function (ret) {
                alert('Error');
            });
    }

}]);

app.controller('RecordOptionCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', 'myFactory', function ($scope, $window, appService, $rootScope, $location, myFactory) {

    $scope.Member = myFactory.get(); // 選擇要評分的成員資料

    // 分數列表
    $scope.PersonalRecord = function () {
        $location.path('/PersonalRecord');
    }

    // 統計圖表
    $scope.ChartRecord = function () {
        $location.path('/ChartRecord');
    }

}]);

// 分數列表
app.controller('PersonalRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', 'myFactory', function ($scope, $window, appService, $rootScope, myFactory) {

    $scope.Member = myFactory.get(); // 選擇要評分的成員資料

}]);

// 統計圖表
app.controller('ChartRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', 'myFactory', function ($scope, $window, appService, $rootScope, myFactory) {

    $scope.Member = myFactory.get(); // 選擇要評分的成員資料

    // 繪圖
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

}]);