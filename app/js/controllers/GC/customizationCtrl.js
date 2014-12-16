four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http', 'User', 'Order', 'Product',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http, User, Order, Product) {

        var today = new Date();
        $scope.currentDate = angular.copy(today);
        $scope.maxDate = today.setDate(today.getDate() + 120);

        $scope.recipientList = angular.copy(Customization.getRecipients());
        $scope.selectedProduct = Customization.getProduct();

        $scope.selectedRecipients = [];

        $scope.logoOptions = [];

        Product.get($scope.selectedProduct.InteropID, function(p) {
            $scope.currentProduct = p;
        });

        //Move this to a service -- It is recommended to not make any HTTP calls within a controller
        $http.get('https://gca-svcs02-dev.cloudapp.net/ClientService/GetTemplateThumbnails?s=' + $scope.selectedProduct.ExternalID + '&o=1').
            success(function(data){
                $scope.Templates = data;
                if (data.length == 1) $scope.selectTemplate(data[0]);
            }).
            error(function(data, status, headers, config ) {
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            }
        );

        $scope.selectTemplate = function(template) {
            if ($scope.selectedProduct.Specs['DesignID']) $scope.selectedProduct.Specs['DesignID'].Value = template.DesignId;
            if ($scope.selectedProduct.Specs['DesignName']) $scope.selectedProduct.Specs['DesignName'].Value = template.Name;
        };

        $scope.selectRecipient = function(recipient) {
            if (!recipient.Valid) return;
            if (!recipient.Selected) {
                recipient.Selected = true;
                $scope.selectedRecipients.push(recipient);
            }
            else {
                recipient.Selected = false;
                for (var i = 0; i < $scope.selectedRecipients.length; i++) {
                    if ($scope.selectedRecipients[i].UserID == recipient.UserID) {
                        $scope.selectedRecipients.splice(i, 1);
                    }
                }
            }
        };

        $scope.addToCartStatic = function(product) {
            Customization.addToCartStatic(product, $scope.selectedRecipients, $scope.currentOrder, function(order) {
                $scope.currentOrder = order;
                Order.save($scope.currentOrder, function(data) {
                    $scope.user.CurrentOrderID = data.ID;
                    User.save($scope.user, function() {
                        Customization.clearRecipients();
                        $location.path('cart');
                    });
                });
            });
        };
        console.log($scope.selectedRecipients);
        $scope.addToCartVariable = function(product) {
            Customization.addToCartVariable(product, $scope.selectedRecipients, $scope.user, $scope.currentOrder, function(order) {
                $scope.currentOrder = order;
                Order.save($scope.currentOrder, function(data) {
                    $scope.user.CurrentOrderID = data.ID;
                    User.save($scope.user, function() {
                        Customization.clearRecipients();
                        $location.path('cart');
                    });
                });
            });
        };
    }]);