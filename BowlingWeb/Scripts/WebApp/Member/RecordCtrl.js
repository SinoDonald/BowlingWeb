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

    // 取得個人紀錄
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

    $scope.Account = myFactory.get().Account; // 選擇要評分的主管

    // 取得個人紀錄
    appService.GetMember({ account: $scope.Account })
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    // 查詢個人紀錄
    $scope.PersonalRecord = function () {
        $location.path('/PersonalRecord');
    }

}]);

app.controller('PersonalRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', 'myFactory', function ($scope, $window, appService, $rootScope, myFactory) {

    $scope.Account = myFactory.get().Account; // 選擇要評分的主管

    // 取得個人紀錄
    appService.GetMember({ account: $scope.Account })
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

}]);