four51.app.directive('imageonload', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('load', function(el) {
				$rootScope.$broadcast('event:imageLoaded', true, el.target.id);
			});
			element.bind('error', function(el) {
				$rootScope.$broadcast('event:imageLoaded', false, el.target.id);
			})
		}
	};
}]);