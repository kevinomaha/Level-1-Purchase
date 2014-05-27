four51.app.directive('resizable', ['$window',
function($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.pageSize = function() {
                if(scope.windowWidth < 767){
                    scope.newPageSize = 2;
                } else if ((768 <= $window.innerWidth) && ($window.innerWidth <= 991)){
                    scope.newPageSize = 4;
                } else if ((992 <= $window.innerWidth) && ($window.innerWidth <= 1199)){
                    scope.newPageSize = 5;
                } else {
                    scope.newPageSize = 10;
                }
                return scope.newPageSize;
            }

        }, true);

        w.bind('resizable', function () {
            scope.$apply();
        });
    }
}]);