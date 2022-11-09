var app = angular.module('app', []);

app.run(['$http', '$window', function ($http, $window) {
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $http.defaults.headers.common['__RequestVerificationToken'] = $('input[name=__RequestVerificationToken]').val();
}]);

app.service('appService', ['$http', function ($http) {

    // 取得個人紀錄
    this.ReadData = function (o) {
        return $http.post("Member/ReadData", o);
    };

    //// 讀取資料
    //appService.ReadData({})
    //    .then(function (ret) {
    //        $scope.Member = ret.data;
    //    })
    //    .catch(function (ret) {
    //        alert('Error');
    //    });

}]);

app.controller('ReadCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    $scope.Member = [];

    // 讀取資料
    appService.ReadData({})
        .then(function (ret) {
            $scope.Member = ret.data;
        })
        .catch(function (ret) {
            alert('Error');
        });

    //function fillCsv(csv) {
    //    var rows = csv.split('\n');
    //    //TODO: 未考慮筆數不吻合的情況
    //    for (var r = 0; r < rows.length; r++) {
    //        var cells = rows[r].split('\t');
    //        for (var c = 0; c < cells.length; c++) {
    //            var inp = document.getElementById("C" + r + c);
    //            if (inp) inp.value = cells[c];
    //        }
    //    }
    //}
}]);