four51.app

    .directive('customtextfield', function() {
        return {
            scope: {
                customfield : '=',
                changed: '='
            },
            restrict: 'E',
            transclude: true,
            templateUrl: 'partials/controls/customTextField.html',
            controller: 'CustomTextFieldCtrl'
        };
    })

    .controller('CustomTextFieldCtrl', ['$scope', function ($scope) {
        var today = new Date();
        $scope.currentDate = angular.copy(today);
        $scope.maxDate = today.setDate(today.getDate() + 120);
    }]);