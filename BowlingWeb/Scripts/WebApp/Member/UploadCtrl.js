var app = angular.module('app');

app.controller('UploadCtrl', ['$scope', '$window', 'appService', '$rootScope', function ($scope, $window, appService, $rootScope) {

    // 開啟關閉上傳按鈕
    $(function () {
        $('#files').change(function () {
            if ($('#files')[0].files.length > 0) {
                $('#uploadBtn').removeAttr('disabled');
            }
            else {
                $('#uploadBtn').attr('disabled', true)
            }
        })
    });

    // 檔案上傳成功或失敗訊息
    // 使用 $timeout 或者是確保 View 載入後再綁定，但通常放在 controller 內直接執行即可
    $(function () {
        // 確保這段程式碼執行時，jquery.form.js 已經載入
        $("#UploadForm").ajaxForm({
            iframe: true,
            dataType: "json",
            success: function (result) {
                // 如果需要清除表單，建議手動清除或確認 resetForm 是否可用
                $("#UploadForm").resetForm();
                if (result.success) {
                    toastr.success(result.message, 'Success Message')
                }
                else {
                    toastr.error(result.message, 'Error Message')
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#UploadForm")[0].reset(); // 使用原生 JS reset 比較保險
                toastr.error('檔案上傳錯誤.', 'Error Message')
            }
        });
    });

    // 上傳員工名單
    $(document).on("click", "#btnUpload", function () {
        // ... (保留您原本的邏輯) ...
        var files = $("#importFile").get(0).files;
        var formData = new FormData();
        formData.append('importFile', files[0]);

        $.ajax({
            url: '/Member/ImportFile',
            data: formData,
            type: 'POST',
            contentType: false,
            processData: false,
            success: function (data) {
                if (data.length > 0) {
                    // 使用 $scope.$apply 確保 Angular 知道資料變更了
                    $scope.$apply(function () {
                        $scope.Test = data;
                    });

                    // 建議盡量使用 ng-repeat 顯示，不要用 jQuery 修改 innerHTML，不過暫時維持原樣也可
                    $("#result").html('<div class="row"><div class="col" style="align-items:center" ng-repeat="name in Test"><h6 class="list-group-item" style="color:crimson">{{ name.Name }}</h6></div></div>');
                } else {
                    alert("上傳檔案格式錯誤");
                }
            }
        });
    });

}]);