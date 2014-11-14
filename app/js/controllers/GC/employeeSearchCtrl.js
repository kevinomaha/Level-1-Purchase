four51.app.controller('EmployeeSearchCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'EmployeeSearch', 'Customization',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, EmployeeSearch, Customization) {

        $scope.selectedProduct = Customization.getProduct();
        $scope.selectedProduct.Name = $scope.selectedProduct.Name ? $scope.selectedProduct.Name : "";

        $scope.searchCriterion = {};
        $scope.employees = [];
        $scope.searchError = "";
        $scope.searchIndicator = false;
        $scope.seachEmployees = function(searchCriterion) {
            $scope.searchIndicator = true;
            $scope.searchError = "";
            $scope.employees = [];
            if (objKeyCount(searchCriterion) > 0) {
                EmployeeSearch.search(searchCriterion, $scope.user, function(data) {
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
            Customization.setEmployee(employee);
            $scope.selectedProduct = Customization.getProduct();
            if ($scope.selectedProduct.Name.indexOf('Visa') > -1) {
                $location.path('visa');
            }
            else {
                $location.path('customizationStep1');
            }
        };

        $scope.clearSearch = function() {
            $scope.searchCriterion = {};
            $scope.employees = [];
        };

        /*$scope.searchTest = function() {
            $.ajax({
                method: "GET",
                url: 'https://gca-svcs01-dev.cloudapp.net/ClientService/GetUsers?p=1&ln=thompson&callback=?',
                dataType: 'jsonp',
                success: function(response, extra){
                    console.log(response);
                    console.log(extra);
                },
                error: function(response) {
                    console.log(response);
                }
            });
        };*/
    }]);