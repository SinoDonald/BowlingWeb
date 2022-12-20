var app = angular.module('app', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('AllMemberRecord', {
            url: '/AllMemberRecord',
            templateUrl: 'Member/AllMemberRecord'
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

// 顯示成員名單
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
                $location.path('/ChartRecord');
            })
            .catch(function (ret) {
                alert('Error');
            });
    }

}]);

// 統計圖表
app.controller('ChartRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', 'myFactory', function ($scope, $window, appService, $rootScope, $location, myFactory) {

    $scope.Member = myFactory.get(); // 選擇要評分的成員資料

    // select year and month
    $scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    $scope.years = [];

    const date = new Date();
    const [month, year] = [date.getMonth(), date.getFullYear()];

    for (let i = year; i !== 2019; i--) {
        $scope.years.push(i.toString());
    }

    $scope.selectedYear = $scope.years[0];
    $scope.selectedMonth = $scope.months[month];


    $scope.data = [];

    $scope.ctrl = {};
    $scope.ctrl.datepicker = moment().add(-1, 'months').locale('zh-tw').format('YYYY-MM');

    // 分數列表
    $scope.PersonalRecord = function () {
        $location.path('/PersonalRecord');
    }

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

// 分數列表
app.controller('PersonalRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', 'myFactory', function ($scope, $window, appService, $rootScope, myFactory) {

    $scope.Member = myFactory.get(); // 選擇要評分的成員資料

}]);