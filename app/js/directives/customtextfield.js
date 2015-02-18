four51.app.directive('customtextfield', function() {
    var obj = {
        scope: {
            customfield : '=',
	        changed: '='
        },
        restrict: 'E',
        transclude: true,
        templateUrl: 'partials/controls/customTextField.html',
        controller: CustomTextFieldCtrl
    }
    return obj;

    CustomTextFieldCtrl.$inject = ['$scope'];
    function CustomTextFieldCtrl($scope) {
        var today = new Date();
        $scope.currentDate = angular.copy(today);
        $scope.maxDate = today.setDate(today.getDate() + 120);
    }
});