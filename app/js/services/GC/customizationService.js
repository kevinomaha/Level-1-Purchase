four51.app.factory('Customization', ['$451', 'ProductDescription',
    function($451, ProductDescription) {

        var recipientList = store.get('451Cache.RecipientList') ? store.get('451Cache.RecipientList') : [];
        var selectedProduct = store.get('451Cache.SelectedProduct') ? store.get('451Cache.SelectedProduct') : {};

        var _getRecipients = function() {
            return recipientList;
        };

        var _setRecipients = function(list) {
            recipientList = list;
            if (recipientList.length == 0) recipientList.AssignToAll = {};
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

        var _addToCart = function(product, order) {
            if (!order) {
                order = {};
                order.LineItems = [];
            }
            if (!order.LineItems) {
                order.LineItems = [];
            }
            var lineItem = {};
            lineItem.Quantity = 1;
            lineItem.Product = product;
            order.LineItems.push(lineItem);
        };

        var _employeeToSpecs = function(employee, product) {
            if (product.Specs) {
                angular.forEach(product.Specs, function(spec) {
                    switch(spec.Name) {
                        case "FirstName":
                            spec.Value = employee.FirstName;
                            break;
                        case "LastName":
                            spec.Value = employee.LastName;
                            break;
                    }
                });
            }
        };

        var _addRecipient = function(recipient, recipientList) {
            recipient.Selected = true;
            recipient.BeingEdited = false;
            recipient.Valid = false;
            if (recipientList.AssignToAll && recipientList.AssignToAll.Address) recipient.Address = recipientList.AssignToAll.Address;
            recipientList.push(recipient);
            return this;
        };

        var _removeRecipient = function(recipient, recipientList) {
            recipient.Selected = false;
            for (var i = 0; i < recipientList.length; i++) {
                if (recipientList[i].UserID == recipient.UserID) {
                    recipientList[i].Selected = false;
                    recipientList.splice(i, 1);
                }
            }
            return this;
        };

        var _validateRecipientList = function(recipientList) {
            recipientList.ValidCount = 0;
            angular.forEach(recipientList, function(recipient) {
                recipient.Valid = false;
                if (recipient.Address.ID) {
                    recipient.Valid = true;
                    recipientList.ValidCount++;
                }
            });
            return this;
        };

        var _setAddress = function(address, recipient, reciplist) {
            angular.forEach(reciplist, function(r) {
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
            addToCart: _addToCart,
            employeeToSpecs: _employeeToSpecs,
            addRecipient: _addRecipient,
            removeRecipient: _removeRecipient,
            validateRecipientList: _validateRecipientList,
            setAddress: _setAddress
        }
    }]);