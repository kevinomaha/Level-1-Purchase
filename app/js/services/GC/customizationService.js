four51.app.factory('Customization', ['$451', 'ProductDescription', 'Variant',
    function($451, ProductDescription, Variant) {

        var recipientList = store.get('451Cache.RecipientList') ? store.get('451Cache.RecipientList'): {List:[]};
        var selectedProduct = store.get('451Cache.SelectedProduct') ? store.get('451Cache.SelectedProduct') : {};

        var _getRecipients = function() {
            return recipientList;
        };

        var _setRecipients = function(list) {
            recipientList = list;
            if (recipientList.List.length == 0) recipientList.AssignToAll = {};
            store.set('451Cache.RecipientList', recipientList);
        };

        function productType(p) {
            var type = "";

            if (p.Name.indexOf('Digital') > -1) {
                type = "Digital";
            }
            else if (p.Name.indexOf('Original') > -1) {
                type = "Original";
            }
            else if (p.Name.indexOf('e-Cards') > -1) {
                type = "e-Cards";
            }
            else if (p.Name.indexOf('Visa') > -1) {
                type = "Visa";
            }
            else {
                type = "Merchant";
            }

            return type;
        }

        function _extendProduct(product) {
            product.ProductType = productType(product);

            angular.forEach(product.Specs, function(spec) {
                spec.Value = spec.DefaultValue ? spec.DefaultValue : null;
            });

            if (product.ExternalID) ProductDescription.parse(product); //Only parse description of product, not product's category
        }

        var _setProduct = function(product) {
            selectedProduct = product;
            _extendProduct(selectedProduct);

            store.set('451Cache.SelectedProduct', product);
        };

        var _getProduct = function() {
            return selectedProduct;
        };

        var randomString = function() {
            var chars = "0123456789abcdefghijklmnop";
            var string_length = 7;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            return randomstring;
        };

        var _addToCartStatic = function(product, selectedRecipients, order) {
            if (!order) {
                order = {};
                order.LineItems = [];
            }
            if (!order.LineItems) {
                order.LineItems = [];
            }

            angular.forEach(selectedRecipients, function(recipient) {
                var lineItem = {};
                lineItem.Quantity = 1;
                lineItem.Product = angular.copy(product);
                lineItem.UniqueID = randomString();
                lineItem.ShipAddressID = recipient.Address.ID;

                angular.forEach(product.Specs, function(spec) {
                    switch(spec.Name) {
                        case "FirstName":
                            lineItem.Product.Specs[spec.Name].Value = recipient.FirstName;
                            break;
                        case "LastName":
                            lineItem.Product.Specs[spec.Name].Value = recipient.LastName;
                            break;
                        case "Email":
                            lineItem.Product.Specs[spec.Name].Value = recipient.Username;
                            break;
                    }
                });

                order.LineItems.push(lineItem);
            });
        };

        function recipientToSpecs(employee, product) {
            if (product.Specs) {
                angular.forEach(product.Specs, function(spec) {
                    switch(spec.Name) {
                        case "FirstName":
                            spec.Value = employee.FirstName;
                            break;
                        case "LastName":
                            spec.Value = employee.LastName;
                            break;
                        case "RecipientID":
                            spec.Value = employee.EmployeeNumber;
                            break;
                        case "RecipientEmailAddress":
                            spec.Value = employee.Username;
                            break;
                        case "Email":
                            spec.Value = employee.Username;
                            break;
                        case "Marketplace":
                            spec.Value = employee.Marketplace;
                            break;
                        case "JobFamily":
                            spec.Value = employee.JobFamily;
                            break;
                        case "Supervisor":
                            spec.Value = employee.Supervisor;
                            break;
                        case "ADPCode":
                            spec.Value = employee.ADPCompanyCode;
                            break;
                        case "SerialNumber":
                            spec.Value = employee.SerialNumber;
                            break;
                    }
                });
            }
            return product;
        }

        var _addToCartVariable = function(product, selectedRecipients, user, order, success) {
            if (!order) {
                order = {};
                order.LineItems = [];
            }
            if (!order.LineItems) {
                order.LineItems = [];
            }

            var recipCount = selectedRecipients.length;
            var variantCount = 0;

            function saveVariant(variant, recipient) {
                Variant.save(variant, function(data) {
                    variantCount++;
                    var li = {
                        Product: product,
                        Variant: data,
                        Quantity: 1,
                        ShipAddressID: recipient.Address.ID
                    };
                    order.LineItems.push(li);
                    if (recipCount == variantCount) success(order);
                });
            }

            angular.forEach(selectedRecipients, function(recipient) {
                var employeeProduct = recipientToSpecs(recipient, angular.copy(product));
                var variant = {
                    ProductInteropID: product.InteropID,
                    Specs: employeeProduct.Specs
                };
                saveVariant(variant, recipient);
            });
        };

        var _addRecipient = function(recipient, recipientList) {
            recipient.Added = true;
            recipient.BeingEdited = false;
            recipient.Valid = false;
            if (recipientList.AssignToAll && recipientList.AssignToAll.Address) recipient.Address = recipientList.AssignToAll.Address;
            recipientList.List.push(recipient);
            return this;
        };

        var _removeRecipient = function(recipient, recipientList) {
            recipient.Added = false;
            for (var i = 0; i < recipientList.List.length; i++) {
                if (recipientList.List[i].UserID == recipient.UserID) {
                    recipientList.List[i].Added = false;
                    recipientList.List.splice(i, 1);
                }
            }
            return this;
        };

        var _validateRecipientList = function(recipientList) {
            recipientList.ValidCount = 0;
            angular.forEach(recipientList.List, function(recipient) {
                recipient.Valid = false;
                if (recipient.Address.ID) {
                    recipient.Valid = true;
                    recipientList.ValidCount++;
                }
            });
            return this;
        };

        var _setAddress = function(address, recipient, reciplist) {
            angular.forEach(reciplist.List, function(r) {
                if (r.UserID == recipient.UserID || recipient.Address.AssignToAll) {
                    r.Address = address;
                    r.BeingEdited = false;
                }
            });
            if (recipient.Address.AssignToAll) {
                reciplist.AssignToAll = {Address: address};
            }
            return this;
        };

        return {
            getRecipients: _getRecipients,
            setRecipients: _setRecipients,
            setProduct: _setProduct,
            getProduct: _getProduct,
            addToCartStatic: _addToCartStatic,
            addToCartVariable: _addToCartVariable,
            addRecipient: _addRecipient,
            removeRecipient: _removeRecipient,
            validateRecipientList: _validateRecipientList,
            setAddress: _setAddress
        }
    }]);