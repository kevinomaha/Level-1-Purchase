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

        function getTemplateThumnails() {
            Customization.getTemplateThumbnails($scope.selectedProduct, function(templates) {
                $scope.Templates = templates;
                if ($scope.Templates.length > 0)  {
                    $scope.selectTemplate($scope.Templates[0]);
                }
            },$scope.user);
        }
        getTemplateThumnails();

        $scope.selectTemplate = function(template) {
            if ($scope.selectedProduct.Specs['DesignID']) $scope.selectedProduct.Specs['DesignID'].Value = template.DesignId;
            if ($scope.selectedProduct.Specs['DesignName']) $scope.selectedProduct.Specs['DesignName'].Value = template.Name;
        };

        if ($scope.recipientList.List) {
            angular.forEach($scope.recipientList.List, function(recipient) {
                if (recipient.Valid) {
                    recipient.Selected = true;
                    $scope.selectedRecipients.push(recipient);
                }
            });
            if ($scope.recipientList.List.length == 1) replaceRecipientTokens();
            replacePurchaserTokens();
        }

        function replaceRecipientTokens() {
            var recipient = $scope.recipientList.List[0];
            angular.forEach($scope.selectedProduct.Specs, function(spec) {
                if (spec.Value) {
                    spec.Value = spec.Value.toString().replace("[[RecipientFirstName]]", recipient.FirstName);
                    spec.Value = spec.Value.toString().replace("[[RecipientLastName]]", recipient.LastName);
                }

                switch(spec.Name) {
                    case "FirstName":
                        spec.Value = recipient.FirstName;
                        break;
                    case "LastName":
                        spec.Value = recipient.LastName;
                        break;
                    case "RecipientID":
                        spec.Value = (recipient.EmployeeNumber || recipient.RecipientID);
                        break;
                    case "RecipientEmailAddress":
                        spec.Value = recipient.RecipientEmailAddress;
                        break;
                    case "Email":
                        spec.Value = recipient.RecipientEmailAddress;
                        break;
                    case "Email1":
                        spec.Value = recipient.RecipientEmailAddress;
                        break;
                }
            });
        }

        function replacePurchaserTokens() {
            angular.forEach($scope.selectedProduct.Specs, function(spec) {
                if (spec.Value) {
                    spec.Value = spec.Value.toString().replace("[[PurchaserFirstName]]", $scope.user.FirstName);
                    spec.Value = spec.Value.toString().replace("[[PurchaserLastName]]", $scope.user.LastName);
                }
            });
        }

        //Automatically selecting all recipients - TP#12177
        /*$scope.selectRecipient = function(recipient) {
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
        };*/

        $scope.generateAwardsIndicator = false;

        $scope.addToCartStatic = function(product) {
            $scope.generateAwardsIndicator = true;
            Customization.addToCartStatic(product, $scope.selectedRecipients, $scope.currentOrder, function(order) {
                $scope.currentOrder = order;
                Order.save($scope.currentOrder, function(data) {
                    $scope.user.CurrentOrderID = data.ID;
                    User.save($scope.user, function() {
                        Customization.clearRecipients();
                        $scope.generateAwardsIndicator = false;
                        $location.path('cart');
                    });
                });
            });
        };

        $scope.addToCartVariable = function(product) {
            $scope.generateAwardsIndicator = true;

            Customization.addToCartVariable(product, $scope.selectedRecipients, $scope.user, $scope.currentOrder, function(order) {
                $scope.currentOrder = order;
                Order.save($scope.currentOrder, function(data) {
                    $scope.user.CurrentOrderID = data.ID;
                    User.save($scope.user, function() {
                        Customization.clearRecipients();
                        $scope.generateAwardsIndicator = false;
                        $location.path('cart');
                    });
                });
            });
        };

        $scope.selectProductType = function(productID) {
            var productList = $scope.selectedProduct.ProductList;
            Product.get(productID, function (product) {
                product.ProductList = productList;
                $scope.selectedProduct = angular.copy(product);
                Customization.setProduct(product);
                getTemplateThumnails();
                if ($scope.recipientList.List.length == 1) replaceRecipientTokens();
                replacePurchaserTokens();
            });
        };
    }]);