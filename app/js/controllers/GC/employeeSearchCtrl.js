four51.app.controller('EmployeeSearchCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'EmployeeSearch', 'Customization',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, EmployeeSearch, Customization) {

        $scope.selectedProduct = Customization.getProduct();
        $scope.selectedProduct.Name = $scope.selectedProduct.Name ? $scope.selectedProduct.Name : "";

        $scope.recipientList = Customization.getRecipients();

        $scope.searchCriterion = {};
        $scope.employees = [];
        $scope.searchError = "";
        $scope.searchIndicator = false;
        $scope.seachEmployees = function(searchCriterion) {
            $scope.searchIndicator = true;
            $scope.searchError = "";
            $scope.employees = [];
            if (objKeyCount(searchCriterion) > 0) {
                EmployeeSearch.search(searchCriterion, $scope.user, $scope.recipientList, function(data) {
                    $scope.employees = data;
                        $scope.searchIndicator = false;
                },
                function() {
                    $scope.searchError = "No results were returned. Please try again.";
                    $scope.searchIndicator = false;
                });
            }
            else {
                $scope.searchError = "You must enter at least one search criterion";
                $scope.searchIndicator = false;
            }
        };

        function objKeyCount(obj) {
            var count = 0;
            angular.forEach(obj, function(key) {
                if (key && key != "") {
                    count++;
                }
            });
            return count;
        }


        $scope.selectEmployee = function(employee) {
            Customization.addRecipient(employee, $scope.recipientList);
            Customization.validateRecipientList($scope.recipientList);
            Customization.setRecipients($scope.recipientList);
        };

        $scope.removeRecipient = function(recipient) {
            Customization.removeRecipient(recipient, $scope.recipientList);
            Customization.validateRecipientList($scope.recipientList);
            Customization.setRecipients($scope.recipientList);
        };

        $scope.tempRecipient = {};
        $scope.editRecipient = function(recipient) {
            recipient.BeingEdited = true;
            $scope.tempRecipient = angular.copy(recipient);
        };

        $scope.goToCustomization = function() {
            switch($scope.selectedProduct.ProductType) {
                case "Digital":
                    $location.path('customizationStep1');
                    break;
                case "Original":
                    $location.path('customizationStep1'); //should be updated to new path or this step should be dynamic
                    break;
                case "e-Cards":
                    $location.path('customizationStep1'); //should be updated to new path or this step should be dynamic
                    break;
                case "Visa":
                    $location.path('visa');
                    break;
                default:
                    $location.path('catalog/' + $scope.selectedProduct.InteropID);
            }
        };

        $scope.clearSearch = function() {
            $scope.searchCriterion = {};
            $scope.employees = [];
        };
    }]);