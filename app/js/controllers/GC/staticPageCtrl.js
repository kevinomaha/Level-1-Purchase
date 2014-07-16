four51.app.controller('StaticPageCtrl', ['$scope', '$location', '$anchorScroll',
function ($scope, $location, $anchorScroll) {
	$scope.scroll = function(id) {
		$location.hash(id);

		// call $anchorScroll()
		$anchorScroll();
	};

	$scope.go = function(page) {
		$location.path( page );
	};
}]);