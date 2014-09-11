four51.app.controller('MyAccountCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location',
function ($routeParams, $sce, $scope, $451, $rootScope, $location) {

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.myAccountURL = "https://admin.gcincentives.com/Default.aspx?Four51UserName=" + $scope.user.Username;

    $scope.loadingFrame = true;
    $scope.$on('event:imageLoaded', function(event, result, id) {
        $scope.loadingFrame = false;
        $scope.$apply();
    });

}]);