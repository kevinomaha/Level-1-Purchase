'use strict';

four51.app.controller('MyAccountCtrl', function ($routeParams, $sce, $scope, $451, $rootScope, $location) {

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}

	$scope.myAccountURL = "https://admin.gcincentives.com/Default.aspx?Four51UserName=" + $scope.user.Username;

});