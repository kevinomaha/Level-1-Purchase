four51.app.controller('CustomizationCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'Customization', '$http', 'User', 'Order', 'Product',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, Customization, $http, User, Order, Product) {
        var today = new Date();
        $scope.emailSubjectRequired = false;
        $scope.denominationRequired = false;
        $scope.currentDate = angular.copy(today);
        $scope.maxDate = today.setDate(today.getDate() + 120);

        $scope.recipientList = angular.copy(Customization.getRecipients());
        $scope.selectedProduct = Customization.getProduct();

        angular.forEach($scope.recipientList.List, function(recipient) {
            if (recipient.EmailSubject === null || recipient.EmailSubject === '') {
                $scope.emailSubjectRequired = true;
            }
            if (recipient.Denomination === null || recipient.Denomination === '') {
                $scope.denominationRequired = true;
            }
        });

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

        function getLogos() {
            Customization.getLogos(function(logos) {
                $scope.Logos = logos;
            });
        }
        if (['Digital', 'Original', 'e-Cards'].indexOf($scope.selectedProduct.ProductType) > -1) getLogos();

        $scope.selectTemplate = function(template) {
            if ($scope.selectedProduct.Specs['DesignID']) $scope.selectedProduct.Specs['DesignID'].Value = template.DesignId;
            if ($scope.selectedProduct.Specs['DesignName']) $scope.selectedProduct.Specs['DesignName'].Value = template.Name;
        };

        $scope.selectLogo = function(logo) {
            if ($scope.selectedProduct.Specs['ImageID']) {
                $scope.selectedProduct.Specs['ImageID'].Value = logo.ID;
            }
            else {
                $scope.selectedProduct.Specs['ImageID'] = {};
                $scope.selectedProduct.Specs['ImageID'].Value = logo.ID;
            }
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
                    case "Denomination":
                        spec.Value = recipient.Denomination;
                        break;
                    case "OpeningMessage":
                        spec.Value = recipient.OpeningMessage;
                        break;
                    case "PersonalMessage":
                        spec.Value = recipient.PersonalMessage;
                        break;
                    case "ClosingMessage":
                        spec.Value = recipient.ClosingMessage;
                        break;
                    case "EmailSubject":
                        spec.Value = recipient.EmailSubject;
                        break;
                    case "FutureShipDate":
                        spec.Value = recipient.FutureShipDate;
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
            var tempImage = angular.copy($scope.selectedProduct.LargeImageUrl);
            Product.get(productID, function (product) {
                product.ProductList = productList;
                $scope.selectedProduct = angular.copy(product);
                if (!$scope.selectedProduct.LargeImageUrl) $scope.selectedImage.LargeImageUrl = tempImage;
                Customization.setProduct(product);
                getTemplateThumnails();
                if ($scope.recipientList.List.length == 1) replaceRecipientTokens();
                replacePurchaserTokens();
            });
        };

        $scope.$watch('selectedProduct.Quantity', function() {
            if (!$scope.selectedProduct.Quantity) return;

            $scope.ecode_form.$setValidity('Quantity', validateQty());
        });

        function validateQty() {
            if (($scope.selectedProduct.StandardPriceSchedule.MinQuantity && $scope.selectedProduct.Quantity < $scope.selectedProduct.StandardPriceSchedule.MinQuantity) || ($scope.selectedProduct.StandardPriceSchedule.MaxQuantity && $scope.selectedProduct.Quantity > $scope.selectedProduct.StandardPriceSchedule.MaxQuantity)) {
                $scope.qtyInvalid = true;
                return false;
            }
            else {
                $scope.qtyInvalid = false;
                return true;
            }
        }
    }]);