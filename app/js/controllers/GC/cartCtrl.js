four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User', 'Shipper', 'CustomAddressList',
    function ($scope, $routeParams, $location, $451, Order, OrderConfig, User, Shipper, CustomAddressList) {
        $scope.backToCustomization = function() {
            $location.path('main');
        };

        CustomAddressList.getall(function(list) {
            $scope.addresses = list;
            var shippingFound = false;
            angular.forEach($scope.addresses, function(add) {
                if (add.IsShipping && add.IsCustEditable) {
                    shippingFound = true;
                }
                if (add.IsBilling && !add.IsCustEditable && $scope.currentOrder.Total == 0) {
                    $scope.currentOrder.BillAddressID = add.ID;
                }
            });
            if (!shippingFound) $scope.shipaddressform = true;
            $scope.addressesLoading = false;
            for (var a = 0; a < list.length; a++) {
                if (list[a].IsShipping && !list[a].IsCustEditable) {
                    $scope.digitalShipAddressID = list[a].ID;
                    assignDigitalShipAddress();
                    getShippers();
                }
            }
        });

        function assignDigitalShipAddress() {
            for (var i = 0; i < $scope.currentOrder.LineItems.length; i++) {
                if ($scope.currentOrder.LineItems[i].IsDigital) {
                    $scope.currentOrder.LineItems[i].ShipAddressID = $scope.digitalShipAddressID;
                }
            }
        }

        function getShippers() {
            $scope.digitalShipper = null;
            Order.save($scope.currentOrder, function(order) {
                $scope.currentOrder = order;
                Shipper.query($scope.currentOrder, function(list) {
                    $scope.shippers = list;
                    angular.forEach($scope.shippers, function(shipper) {
                        if (shipper.Name.indexOf('Email') > -1) {
                            $scope.digitalShipper = shipper;
                            assignDigitalShipper();
                        }
                    });
                });
            });
        }

        function assignDigitalShipper() {
            for (var i = 0; i < $scope.currentOrder.LineItems.length; i++) {
                if ($scope.currentOrder.LineItems[i].IsDigital) {
                    $scope.currentOrder.LineItems[i].Shipper = angular.copy($scope.digitalShipper);
                    $scope.currentOrder.LineItems[i].ShipperName = $scope.digitalShipper.Name;
                    $scope.currentOrder.LineItems[i].ShipMethod = $scope.digitalShipper.Name;
                    $scope.currentOrder.LineItems[i].ShipperID = $scope.digitalShipper.ID;
                }
            }
        }

        $scope.previewItem = function(item) {
            item.Preview = !item.Preview;
        };

        $scope.$on('event:imageLoaded', function(event, result, id) {
            angular.forEach($scope.currentOrder.LineItems, function(item) {
                if (item.ID == id) {
                    item.LoadingImage = !result;
                }
            });
            $scope.$apply();
        });

        $scope.originalItemSpecs = {};
        $scope.editItem = function(item) {
            $scope.originalItemSpecs[item.ID] = angular.copy(item.Specs);
            item.Editing = true;
        };

        $scope.updateItem = function(item) {
            item.Editing = false;
            for (var i = 0; i < $scope.currentOrder.LineItems.length; i++) {
                if (item.ID == $scope.currentOrder.LineItems[i].ID) {
                    $scope.currentOrder.LineItems[i].Specs = item.Specs;
                    angular.forEach($scope.currentOrder.LineItems[i].Specs, function(spec) {
                        if (spec.Name.toLowerCase().indexOf('futureshipdate') > -1) {
                            var tempDate = new Date(spec.Value);
                            spec.Value = tempDate.getMonth()+1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear();
                        }
                    });
                }
            }
            $scope.saveChanges();
        };

        $scope.cancelEditItem = function(item) {
            item.Editing = false;
            item.Specs = $scope.originalItemSpecs[item.ID];
        };

        $scope.$watch('currentOrder.LineItems', function() {
            if ($scope.currentOrder && $scope.currentOrder.LineItems) {
                angular.forEach($scope.currentOrder.LineItems, function(item) {
                    item.SpecFormValid = true;
                    if (item.Editing) {
                        angular.forEach(item.Specs, function(spec) {
                            if (spec.Required && !spec.Value) {
                                item.SpecFormValid = false;
                            }
                        });
                    }
                });
            }
        }, true);


        $scope.removeItem = function(item) {
            if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
                Order.deletelineitem($scope.currentOrder.ID, item.ID,
                    function(order) {
                        $scope.currentOrder = order;
                        Order.clearshipping($scope.currentOrder);
                        if (!order) {
                            $scope.user.CurrentOrderID = null;
                            User.save($scope.user, function(){
                                $location.path('catalog');
                            });
                        }
                        $scope.displayLoadingIndicator = false;
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function (ex) {
                        $scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

        $scope.objectLength = function(obj) {
            var length = 0;
            angular.forEach(obj, function(property) {
                length++;
            });
            return length;
        };

        $scope.saveChanges = function() {
            $scope.actionMessage = null;
            $scope.errorMessage = null;
            if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
                $scope.cancelOrder();
            }
            else {
                $scope.displayLoadingIndicator = true;
                Order.save($scope.currentOrder,
                    function(data) {
                        $scope.currentOrder = data;
                        $scope.displayLoadingIndicator = false;
                        $scope.actionMessage = 'Your Changes Have Been Saved!';
                    },
                    function(ex) {
                        $scope.errorMessage = ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

        $scope.submitOrder = function() {
            $scope.displayLoadingIndicator = true;
            $scope.errorMessage = null;
            //Zero Priced Orders
            if ($scope.currentOrder.Total == 0) $scope.currentOrder.PaymentMethod = null;
            Order.submit($scope.currentOrder,
                function(order) {
                    $scope.user.CurrentOrderID = null;
                    User.save($scope.user, function(data) {
                        $scope.user = data;
                        $scope.displayLoadingIndicator = false;
                        $scope.currentOrder = null;
                        $location.path('/order/' + order.ID);
                    });
                },
                function(ex) {
                    $scope.errorMessage = ex.Message;
                    $scope.displayLoadingIndicator = false;
                    $scope.shippingUpdatingIndicator = false;
                    $scope.shippingFetchIndicator = false;
                }
            );
        };

        $scope.cancelOrder = function() {
            if (confirm('Are you sure you wish to cancel your order?') == true) {
                $scope.displayLoadingIndicator = true;
                $scope.actionMessage = null;
                Order.delete($scope.currentOrder,
                    function(){
                        $scope.currentOrder = null;
                        $scope.user.CurrentOrderID = null;
                        User.save($scope.user, function(){
                            $location.path('catalog');
                        });
                        $scope.displayLoadingIndicator = false;
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function(ex) {
                        $scope.actionMessage = 'An error occurred: ' + ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

        $scope.updateAllShippers = function() {
            angular.forEach($scope.currentOrder.LineItems, function(item) {
                if (!item.IsDigital) {
                    item.ShipperID = $scope.currentOrder.ShipMethod.ID;
                }
            });
            $scope.saveChanges();
        };

        $scope.$on('event:AddressSaved', function(event, address) {
            var found = false;
            angular.forEach($scope.addresses, function(add) {
                if (add.ID == address.ID) {
                    found = true;
                    add.AddressName = address.AddressName;
                }
            });
            if (!found) {
                $scope.addresses.push(address);
            }
            /*if (address.IsShipping) {
                $scope.setShipAddress(address);
                $scope.shipaddressform = false;
            }*/
            if (address.IsBilling) {
                $scope.currentOrder.BillAddressID = address.ID;
                $scope.billaddressform = false;
            }
            $scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
            $scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };
        });

        var today = new Date();
        $scope.currentDate = angular.copy(today);
        $scope.maxDate = today.setDate(today.getDate() + 120);

        $scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
        $scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };

        function zeroPricedOrder() {
            angular.forEach($scope.addresses, function(add) {
                if (add.IsBilling && !add.IsCustEditable) {
                    $scope.currentOrder.BillAddressID = add.ID;
                }
            });
            $scope.currentOrder.PaymentMethod = null;
        }

        $scope.$watch('currentOrder.LineItems', function() {
            if ($scope.currentOrder && $scope.currentOrder.Total == 0) {
                zeroPricedOrder();
            }
        });

    }]);