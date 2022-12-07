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

    var savedData = {}

    function set(data) {
        savedData.Account = data;
    }

    function get() {
        return savedData;
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

    // 取得所有成員
    appService.GetAllMember({})
        .then(function (ret) {
            $scope.GetAllMember = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

     // 選擇要看的紀錄方式
    $scope.RecordOption = function (data) {
        $location.path('/RecordOption');
        myFactory.set(data)
    }

}]);

app.controller('RecordOptionCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', 'myFactory', function ($scope, $window, appService, $rootScope, $location, myFactory) {

    $scope.Account = myFactory.get().Account; // 選擇要評分的成員

    // 取得個人紀錄
    appService.GetMember({ account: $scope.Account })
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    // 統計圖表
    $scope.ChartRecord = function () {
        $location.path('/ChartRecord');
    }

    // 分數列表
    $scope.PersonalRecord = function () {
        $location.path('/PersonalRecord');
    }

}]);
var optionName = ['Good', 'Gooood', 'Goooood'];
// 統計圖表
app.controller('ChartRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', 'myFactory', function ($scope, $window, appService, $rootScope, myFactory) {

    $scope.Account = myFactory.get().Account; // 選擇要評分的成員

    // 取得個人紀錄
    appService.GetMember({ account: $scope.Account })
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    // 統計圖表
    appService.GetMember({ account: $scope.Account })
        .then(function (ret) {
            CreateChart(ret.data, optionName);
        })
}]);

// 分數列表
app.controller('PersonalRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', 'myFactory', function ($scope, $window, appService, $rootScope, myFactory) {

    $scope.Account = myFactory.get().Account; // 選擇要評分的成員

    // 取得個人紀錄
    appService.GetMember({ account: $scope.Account })
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

}]);








var chartset = [];
var chartdataset = [];
var configset = [];

function CreateChart(chartData, optionsName) {
    for (var i = 0; i != chartData.DateScores.length; i++) {
        //addRow(i);
        var labels = [];
        var scores = []
        for (var j = 0; j != optionsName.length; j++)
            scores.push([])
        chartData.DateScores.forEach(function (item) {
            if (item.CategoryId === i + 1) {
                item.Charts.forEach(function (item2) {
                    labels.push(item2.Content)
                    for (var j = 0; j != optionsName.length; j++) {
                        scores[j].push(item2.Votes[j])
                    }
                })
            }
        });

        var datasets = []
        for (var j = 0; j != optionsName.length; j++) {
            datasets.push({
                label: optionsName[j],
                data: scores[j],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                ],
                borderWidth: 1
            })
        }

        var data = {
            labels: labels,
            datasets: datasets
        };

        chartdataset.push(data);

        var config = {
            type: 'bar',
            data: chartdataset[i],
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
        };

        configset.push(config);
        chartset.push(new Chart(document.getElementById('myChart' + i), configset[i]))
    }
}

function addRow(idx) {
    const div = document.createElement('div');
    div.className = 'row';
    div.innerHTML = '<canvas id="myChart' + idx + '"></canvas>';
    document.getElementById('charts').appendChild(div);
}