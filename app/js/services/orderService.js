four51.app.factory('Order', ['$resource', '$rootScope', '$451', 'Security', 'Error', function($resource, $rootScope, $451, Security, Error) {
    var _multipleShip = false;
    function _then(fn, data, broadcast) {
        if (angular.isFunction(fn))
            fn(data);
        if (!broadcast)
            $rootScope.$broadcast('event:orderUpdate', data);
    }

    var employeeSpecs = [
        "FirstName",
        "LastName",
        "RecipientID",
        "Marketplace",
        "JobFamily",
        "Supervisor",
        "ADPCode",
        "RecipientEmailAddress",
        "Email"
    ];

    var additionalReadOnlySpecs = [
        "OccasionMessage"
    ];

    var filteredSpecs = [
        "Physical/Digital",
        "DesignID",
        "PreviewURL",
        "SerialNumber",
        "DesignName"
    ];

    function _extend(order) {
        order.isEditable = order.Status == 'Unsubmitted' || order.Status == 'Open' || order.Status == 'AwaitingApproval';
        order.IsAllDigital = true;
        order.HasPhysicalMerchantCards = false;
        var images = {};
        order.MerchantCardCount = 0;
        angular.forEach(order.LineItems, function(item) {
            item.LoadingImage = true;
            item.OriginalQuantity = item.Quantity; //needed to validate qty changes compared to available quantity
            angular.forEach(item.Specs, function(spec, index) {
                if (spec.ControlType == 'File' && spec.File && spec.File.Url.indexOf('auth') == -1) {
                    spec.File.Url += "&auth=" + Security.auth();
                }
                spec.Filtered = filteredSpecs.indexOf(spec.Name) > -1;
                spec.ReadOnly = (employeeSpecs.indexOf(spec.Name) > -1 || additionalReadOnlySpecs.indexOf(spec.Name) > -1);
                spec.Required = spec.ReadOnly ? false : spec.Required;
                spec.Placeholder = (spec.Label || spec.Name).replace(/[0-9]/g, '');

                spec.InputType = (spec.Name.toLowerCase().indexOf('email') > -1 && spec.Name.toLowerCase().indexOf('subject') == -1) ? 'email' : (spec.Name.toLowerCase().indexOf('futureshipdate') > -1) ? 'date' : 'text';



                spec.OrderIndex = (spec.Name == 'Message') ? 999 : spec.ListOrder;
            });
            item.SpecsLength = Object.keys(item.Specs).length;

            if (item.Product.Name.indexOf('Digital') == -1 && item.Product.Name.indexOf('e-') == -1) {
                order.IsAllDigital = false;
                item.IsDigital = false;
            }
            else {
                item.IsDigital = true;
            }

            //Physical Merchant Cards exist
            if (item.Product.Name.indexOf(' Gift Card') > -1) {
                order.HasPhysicalMerchantCards = true;
            }

            //All Merchant Cards count
            if (item.Product.Name.indexOf('Gift Card') > -1) {
                order.MerchantCardCount++;
            }

            if (!images[item.Product.ExternalID]) {
                images[item.Product.ExternalID] = {};
                images[item.Product.ExternalID].LargeImageUrl = item.Product.LargeImageUrl;
                images[item.Product.ExternalID].SmallImageUrl = item.Product.SmallImageUrl;
            }
            else {
                item.Product.LargeImageUrl = images[item.Product.ExternalID].LargeImageUrl;
                item.Product.SmallImageUrl = images[item.Product.ExternalID].SmallImageUrl;
            }
        });

        if (order.CreditCard && order.CreditCard.DisplayName) {
            order.CreditCard.GCDisplayName = order.CreditCard.DisplayName.replace('**** **** **** ', 'x');
        }

        order.forceMultipleShip = function(value) {
            _multipleShip = value;
        };

        order.IsMultipleShip = function() {
            var multi = false;
            if (_multipleShip && order.LineItems[0].ShipAddressID == null) return true;
            angular.forEach(order.LineItems, function(li, i) {
                if (multi) return;
                multi = i > 0 ?
                    (li.ShipAddressID != order.LineItems[i-1].ShipAddressID || li.ShipperID != order.LineItems[i-1].ShipperID) :
                    false;
            });
            return multi;
        };

        var filteredFields = [
            "Opening",
            "Message",
            "Closing"
        ];

        angular.forEach(order.OrderFields, function(field) {
            field.Filtered = filteredFields.indexOf(field.Name) > -1;
            field.Placeholder = (field.Label || field.Name).replace(/[0-9]/g, '');
            field.InputType = (field.Name.toLowerCase().indexOf('email') > -1 && field.Name.toLowerCase().indexOf('subject') == -1) ? 'email' : 'text';
            field.OrderIndex = (field.Name == 'Message') ? 999 : field.ListOrder;
        });
    }

    var _get = function(id, success, suppress) {
        var currentOrder = store.get('451Cache.Order.' + id);
        currentOrder ? (function() { _extend(currentOrder);	_then(success, currentOrder); })() :
            $resource($451.api('order/:id'), { id: '@id' }).get({ id: id }).$promise.then(function(o) {
                _extend(o);
                store.set('451Cache.Order.' + id, o);
                _then(success, o, suppress);
            });
    };

    var _save = function(order, success, error) {
        var paymentMethod = order.PaymentMethod;
        var CC = order.CreditCard;
        var CCID = order.CreditCardID;
        //var savedCards = order.SavedCards;
        var billAddressID = order.BillAddressID;
        $resource($451.api('order')).save(order).$promise.then(
            function(o) {
                o.PaymentMethod = paymentMethod ? paymentMethod : 'Undetermined';
                o.CreditCard = CC ? CC : {};
                o.CreditCardID = CCID ? CCID : null;
                //o.SavedCards = savedCards ? savedCards : null;
                o.BillAddressID = billAddressID ? billAddressID : null;
                store.set('451Cache.Order.' + o.ID, o);
                store.remove('451Cache.User' + $451.apiName);
                _extend(o);
                _then(success, o);
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _delete = function(order, success, error) {
        $resource($451.api('order')).delete().$promise.then(
            function() {
                store.remove('451Cache.Order.' + order.ID);
                store.remove('451Cache.User' + $451.apiName);
                _then(success);
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _submit = function(order, success, error) {
        $resource($451.api('order'), { }, { submit: { method: 'PUT' }}).submit(order).$promise.then(
            function(o) {
                store.set('451Cache.Order.' + o.ID);
                store.remove('451Cache.User' + $451.apiName);
                _extend(o);
                _then(success,o);
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _repeat = function(id, success, error) {
        $resource($451.api('order/repeat/:id'), {'id': id}, { repeat: { method: 'PUT'}}).repeat().$promise.then(
            function(o) {
                store.set('451Cache.Order.' + o.ID);
                store.remove('451Cache.User' + $451.apiName);
                _extend(o);
                _then(success, o);
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _approve = function(order, success, error) {
        $resource($451.api('order/approve/:id'), {'id': order.ID}, { approve: { method: 'PUT', params: { 'comment': order.ApprovalComment}}}).approve().$promise.then(
            function(o) {
                _extend(o);
                _then(success, o);
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _decline = function(order, success, error) {
        $resource($451.api('order/decline/:id'), {'id': order.ID}, { decline: { method: 'PUT', params: { 'comment': order.ApprovalComment}}}).decline().$promise.then(
            function(o) {
                _extend(o);
                _then(success, o);
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _deletelineitem = function(id, lineitemid, success, error) {
        store.remove('451Cache.Order.' + id);
        $resource($451.api('order/:id/lineitem/:lineitemid'), {'id': id, 'lineitemid': lineitemid }, { lineitemdelete: { method: 'DELETE'}}).lineitemdelete().$promise.then(
            function(o) {
                if (o.ID) {
                    store.set('451Cache.Order.' + o.ID, o);
                    _extend(o);
                    _then(success, o);
                } else {
                    store.remove('451Cache.User' + $451.apiName);
                    _then(success, null);
                }
            },
            function(ex) {
                error(Error.format(ex));
            }
        );
    };

    var _updateship = function(order) {
        if (!order) return this;
        order.ShipperID = null;
        angular.forEach(order.LineItems, function(li) {
            li.ShipperName = null;
            li.ShipperID = null;
        });
        order.ShipperName = null;
        order.ShippingCost = null;
        return this;
    };

    var _calcdisc = function(order, acct) {
        if (acct == null) return order.Total;
        var discount = 0;
        if (acct.AccountType.MaxPercentageOfOrderTotal != 100) {
            var total = order.Total - acct.Balance;
            if (total < (total / acct.AccountType.MaxPercentageOfOrderTotal))
                discount = total / acct.AccountType.MaxPercentageOfOrderTotal;
            else
                discount = acct.Balance;
        }
        else
            discount = acct.Balance;

        return order.Total - discount;
    };

    var _listShipments = function(order, success){
        $resource($451.api('order/:id/shipments'), { id: order.ID }).query().$promise.then(function(shipments) {
            _then(success, shipments, true);
        });
    };

    return {
        get: _get,
        save: _save,
        delete: _delete,
        submit: _submit,
        repeat: _repeat,
        approve: _approve,
        decline: _decline,
        deletelineitem: _deletelineitem,
        clearshipping: _updateship,
        calculatediscount: _calcdisc,
        listShipments: _listShipments
    }
}]);