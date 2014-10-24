four51.app.controller('MyAccountCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location',
function ($routeParams, $sce, $scope, $451, $rootScope, $location) {

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.myAccountURL = (window.location.href.indexOf("qastore") > -1 || window.location.href.indexOf("teststore") > -1) ?
        "https://stageadmin.gcincentives.com/Default.aspx?Four51UserName=" + $scope.user.Username :
        "https://admin.gcincentives.com/Default.aspx?Four51UserName=" + $scope.user.Username;

    $scope.loadingFrame = true;
    $scope.$on('event:imageLoaded', function(event, result, id) {
        $scope.loadingFrame = false;
        $scope.$apply();
    });

}]);