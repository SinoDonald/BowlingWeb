var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得個人紀錄
    this.GetMember = function (o) {
        return $http.post("Member/GetMember", o);
    };

    //// 取得所有成員
    //this.GetAllMember = function (o) {
    //    return $http.post("Member/GetAllMember", o);
    //};

}]);

app.controller('RecordCtrl', ['$scope', '$window', 'appService', '$rootScope', '$location', function ($scope, $window, appService, $rootScope, $location) {

    $location.path('/PersonalRecord');

}]);

app.controller('PersonalRecordCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 取得個人紀錄
    appService.GetMember({})
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    //// 取得所有成員
    //appService.GetAllMember({})
    //    .then(function (ret) {
    //        $scope.Member = ret.data;
    //    })
    //    .catch(function (ret) {
    //        alert('Error');
    //    });

}]);