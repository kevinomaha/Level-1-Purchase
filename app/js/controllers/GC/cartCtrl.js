four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User', 'Shipper',
    function ($scope, $routeParams, $location, $451, Order, OrderConfig, User, Shipper) {
        $scope.backToCustomization = function() {
            $location.path('main');
        };

        $scope.DigitalShipper = null;
        Shipper.query($scope.currentOrder, function(list) {
            $scope.shippers = list;
            angular.forEach($scope.shippers, function(shipper) {
                if (shipper.Name.indexOf('Email') > -1) {
                    $scope.DigitalShipper = shipper;
                    applyDigitalShipper();
                }
            });
        });

        function applyDigitalShipper() {
            if ($scope.currentOrder && $scope.DigitalShipper) {
                angular.forEach($scope.currentOrder.LineItems, function(item) {
                    if (item.IsDigital) {
                        item.ShipperID = $scope.DigitalShipper.ID;
                    }
                });
            }
        }

        $scope.originalItemSpecs = {};
        $scope.editItem = function(item) {
            $scope.originalItemSpecs[item.ID] = angular.copy(item.Specs);
            item.Editing = true;
        };

        $scope.updateItem = function(item) {
            item.Editing = false;
            for (var i = 0; i < $scope.currentOrder.LineItems; i++) {
                if (item.ID == $scope.currentOrder.LineItem[i].ID) {
                    $scope.currentOrder.LineItem[i].Specs = item.Specs;
                }
            }
            $scope.saveChanges();
        };

        $scope.cancelEditItem = function(item) {
            item.Editing = false;
            item.Specs = $scope.originalItemSpecs[item.ID];
        };

        $scope.$watch('currentOrder.LineItems', function() {
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


        /*var isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
        if (isEditforApproval) {
            Order.get($routeParams.id, function(order) {
                $scope.currentOrder = order;
                // add cost center if it doesn't exists for the approving user
                var exists = false;
                angular.forEach(order.LineItems, function(li) {
                    angular.forEach($scope.user.CostCenters, function(cc) {
                        if (exists) return;
                        exists = cc == li.CostCenter;
                    });
                    if (!exists) {
                        $scope.user.CostCenters.push({
                            'Name': li.CostCenter
                        });
                    }
                });
            });
        }

        $scope.currentDate = new Date();
        $scope.errorMessage = null;
        $scope.continueShopping = function() {
            if (!$scope.cart.$invalid) {
                if (confirm('Do you want to save changes to your order before continuing?') == true)
                    $scope.saveChanges(function() { $location.path('catalog') });
            }
            else
                $location.path('catalog');
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

        $scope.saveChanges = function(callback) {
            $scope.actionMessage = null;
            $scope.errorMessage = null;
            if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
                $scope.cancelOrder();
            }
            else {
                $scope.displayLoadingIndicator = true;
                OrderConfig.address($scope.currentOrder, $scope.user);
                Order.save($scope.currentOrder,
                    function(data) {
                        $scope.currentOrder = data;
                        $scope.displayLoadingIndicator = false;
                        if (callback) callback();
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function(ex) {
                        $scope.errorMessage = ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

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
        }

        $scope.checkOut = function() {
            $scope.displayLoadingIndicator = true;
            if (!isEditforApproval)
                OrderConfig.address($scope.currentOrder, $scope.user);
            Order.save($scope.currentOrder,
                function(data) {
                    $scope.currentOrder = data;
                    $location.path(isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
                    $scope.displayLoadingIndicator = false;
                },
                function(ex) {
                    $scope.errorMessage = ex.Message;
                    $scope.displayLoadingIndicator = false;
                }
            );
        };

        $scope.$watch('currentOrder.LineItems', function(newval) {
            var newTotal = 0;
            if (!$scope.currentOrder) return newTotal;
            angular.forEach($scope.currentOrder.LineItems, function(item){
                newTotal += item.LineTotal;
            });
            $scope.currentOrder.Subtotal = newTotal;
        }, true);

        $scope.copyAddressToAll = function() {
            angular.forEach($scope.currentOrder.LineItems, function(n) {
                n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;
            });
        };

        $scope.copyCostCenterToAll = function() {
            angular.forEach($scope.currentOrder.LineItems, function(n) {
                n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
            });
        };

        $scope.onPrint = function()  {
            window.print();
        };

        $scope.cancelEdit = function() {
            $location.path('order');
        };*/
    }]);