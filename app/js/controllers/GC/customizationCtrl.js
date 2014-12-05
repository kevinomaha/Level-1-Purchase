four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http', 'Order', 'Product',
function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http, Order, Product) {

    $scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems: []};
    if (typeof($scope.tempOrder) != 'object') {
        $scope.tempOrder = LZString.decompressFromUTF16($scope.tempOrder);
        $scope.tempOrder = JSON.parse($scope.tempOrder);
    }

    //personalized opening message
    $scope.openingMessage = {};

    $scope.recipientList = angular.copy(Customization.getRecipients());
    $scope.selectedProduct = Customization.getProduct();

    $scope.selectedRecipients = [];

    console.log("selected product");
    console.log($scope.selectedProduct);
    //Customization.employeeToSpecs($scope.selectedEmployee, $scope.selectedProduct);

    Product.get($scope.selectedProduct.InteropID, function(p) {
        $scope.currentProduct = p;
        console.log("current product");
        console.log($scope.currentProduct);
        console.log("Current logged in user:");
        console.log($scope.user);
    });

    //Move this to a service -- It is recommended to not make any HTTP calls within a controller
    $http.get('https://gca-svcs02-dev.cloudapp.net/ClientService/GetTemplateThumbnails?s=SCD002-GC1-02&o=1').
        success(function(data){
             $scope.getTemplate = data;
             $scope.thumbnail = $scope.getTemplate[0].ThumbnailUrl;
        }).
        error(function(data, status, headers, config ) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });

    $scope.selectRecipient = function(recipient) {
        if (!recipient.Valid) return;
        if (!recipient.Selected) {
            recipient.Selected = true;
            $scope.selectedRecipients.push(recipient);
        }
        else {
            recipient.Selected = false;
            for (var i = 0; i < $scope.selectedRecipients; i++) {
                if ($scope.selectedRecipients[i].UserID == recipient.UserID) {
                    $scope.selectedRecipients.splice(i, 1);
                }
            }
        }
    };

    $scope.addToCartStatic = function(product) {
        Customization.addToCartStatic(product, $scope.selectedRecipients, $scope.tempOrder);
        $scope.cacheOrder($scope.tempOrder);
        $location.path('cart');
    };

    $scope.addToCartVariable = function(product) {
        Customization.addToCartVariable(product, $scope.selectedRecipients, $scope.tempOrder);
        $scope.cacheOrder($scope.tempOrder);
        $location.path('cart');
    };
}]);