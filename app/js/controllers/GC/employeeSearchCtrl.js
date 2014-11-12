four51.app.controller('EmployeeSearchCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'EmployeeSearch', 'Customization',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, EmployeeSearch, Customization) {

        $scope.searchCriterion = {};
        $scope.searchError = "";
        $scope.seachEmployees = function(searchCriterion) {
            $scope.searchError = "";
            if (objKeyCount(searchCriterion) > 0) {
                EmployeeSearch.search(searchCriterion, function(data) {
                    $scope.employees = data;
                });
            }
            else {
                $scope.searchError = "You must enter at least one search criterion";
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
            $location.path('customizationStep1')
        };

        $scope.searchTest = function() {
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
        };
    }]);