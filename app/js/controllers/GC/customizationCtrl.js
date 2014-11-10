four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http',
function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http) {

    $scope.selectedEmployee = Customization.getEmployee();
    console.log($scope.selectedEmployee); //fill in inputs with employee details

    $http.get('http://gca-svcs01-dev.cloudapp.net/ClientService/getThumbnailImage?d=1').
        success(function(data){
            console.log(data);
            $scope.getTemplate = data;
        });
}]);