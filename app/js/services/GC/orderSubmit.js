four51.app.factory('OrderSubmit', ['$resource', '$451', '$location', '$rootScope', 'Order', 'Address', 'LineItems',
function($resource, $451, $location, $rootScope, Order, Address, LineItems) {

    function _then(fn, data) {
        if (angular.isFunction(fn))
            fn(data);
    }

    function updateAddress(id, phone, updatedAddresses, len, order, success) {
        Address.get(id, function(add) {
            var address = add;
            address.Phone = phone;
            Address.save(address, function(a) {
                if (updatedAddresses == len)
                    saveOrder(order, success);
            });
        });
    }

    function saveOrder(orderSave, success) {
        var tempSave = angular.copy(orderSave);
        if (tempSave.PaymentMethod == 'CreditCard') {
            tempSave.BudgetAccountID = null;
        }
        delete orderSave.lineItemGroups;
        delete orderSave.merchantCardsAllDigital;
        delete orderSave.merchantCardLineItems;
        delete orderSave.SavedCards;
        angular.forEach(orderSave.LineItems, function (li) {
            delete li.Shipper;
        });
        var CC = orderSave.CreditCard ? orderSave.CreditCard : {};
        Order.save(orderSave,
            function (o) {
                LineItems.clean(o);
                var orderSubmit = angular.copy(o);
                orderSubmit.CreditCard = CC;
                LineItems.cleanPreSubmit(orderSubmit);
                _then(success, orderSubmit);
            },
            function (ex) {
                $rootScope.$broadcast('orderSubmitFailed');
            }
        );
    }

    var _save = function(order, success) {
        var orderSave = angular.copy(order);

        var shipAddresses = [];
        angular.forEach(orderSave.LineItems, function (item) {
            if (shipAddresses.indexOf(item.ShipAddressID) == -1) {
                shipAddresses.push(item.ShipAddressID);
            }
        });

        var billAddressPhone = orderSave.BillAddress.Phone;
        var updatedAddresses = 0;
        angular.forEach(shipAddresses, function(id) {
            updatedAddresses++;
            updateAddress(id, billAddressPhone, updatedAddresses, shipAddresses.length, orderSave, success);
        });
    };

    var _submit = function(order, wait) {
        if (!wait) $rootScope.$broadcast('orderSubmitStarted');
        Order.submit(order, function (data) {
                var recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];
                for (var r = 0; r < recipientList.length; r++) {
                    recipientList[r].AwardCount = 0;
                }
                store.set("451Cache.RecipientList", []);
                store.set("451Cache.RecipientList", recipientList);
                if (wait) {
                    $location.path('/order/' + data.ID);
                }
                else {
                    $rootScope.$broadcast('orderSubmitComplete', data);
                }
            },
            function (ex) {
                if (ex.Code.is('ObjectExistsException')) { // unique id
                    ex.Message = ex.Message.replace('{0}', 'Order ID (' + $scope.currentOrder.ExternalID + ')');
                }
                $rootScope.$broadcast('orderSubmitFailed');
            });
    };

    return {
        save: _save,
        submit: _submit
    }
}]);