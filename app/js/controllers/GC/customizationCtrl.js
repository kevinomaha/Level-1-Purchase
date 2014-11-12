four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http',
function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http) {

    $scope.selectedEmployee = Customization.getEmployee();
    console.log($scope.selectedEmployee); //fill in inputs with employee details

    $http.get('https://gca-svcs01-dev.cloudapp.net/ClientService/GetTemplateThumbnails?s=SCD002-GC1-02&o=1').
        success(function(data){
            console.log(data);
            $scope.getTemplate = data;
            console.log($scope.getTemplate);
            $scope.thumbnail = $scope.getTemplate[0].ThumbnailUrl;
            console.log($scope.thumbnail);

            //console.log($scope.getTemplate.ThumbNailUrl);

        });
}]);