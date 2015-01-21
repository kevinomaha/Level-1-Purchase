four51.app.factory('Customization', ['$451', '$http', 'ProductDescription', 'User',
    function($451, $http, ProductDescription, User) {

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

        var _clearRecipients = function() {
            recipientList = {List:[], AssignToAll: {}};
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

        function replaceTokens(spec, recipient, user) {
            if (spec.Value) {
                spec.Value = spec.Value.toString().replace("[[RecipientFirstName]]", recipient.FirstName);
                spec.Value = spec.Value.toString().replace("[[RecipientLastName]]", recipient.LastName);
                spec.Value = spec.Value.toString().replace("[[PurchaserFirstName]]", user.FirstName);
                spec.Value = spec.Value.toString().replace("[[PurchaserLastName]]", user.LastName);
            }
        }

        function recipientToSpecs(recipient, product, user) {
            if (product.Specs) {
                angular.forEach(product.Specs, function(spec) {
                    switch(spec.Name) {
                        case "FirstName":
                            spec.Value = recipient.FirstName;
                            break;
                        case "LastName":
                            spec.Value = recipient.LastName;
                            break;
                        case "RecipientID":
                            spec.Value = recipient.EmployeeNumber;
                            break;
                        case "RecipientEmailAddress":
                            spec.Value = recipient.EmailAddress;
                            break;
                        case "Email":
                            spec.Value = recipient.EmailAddress;
                            break;
                        case "Marketplace":
                            spec.Value = recipient.Marketplace;
                            break;
                        case "JobFamily":
                            spec.Value = recipient.JobFamily;
                            break;
                        case "Supervisor":
                            spec.Value = recipient.Supervisor;
                            break;
                        case "ADPCode":
                            spec.Value = recipient.ADPCompanyCode;
                            break;
                    }

                    replaceTokens(spec, recipient, user);
                });
            }
            return product;
        }

        var _addToCartStatic = function(product, selectedRecipients, order, success) {
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
                lineItem.Product = recipientToSpecs(recipient, angular.copy(product));
                lineItem.UniqueID = randomString();
                lineItem.ShipAddressID = recipient.Address.ID;

                lineItem.Specs = angular.copy(lineItem.Product.Specs);
                order.LineItems.push(lineItem);
            });
            success(order);
        };

        var _addToCartVariable = function(product, selectedRecipients, user, order, success) {
            if (!order) {
                order = {};
                order.LineItems = [];
            }
            if (!order.LineItems) {
                order.LineItems = [];
            }

            var recipCount = selectedRecipients.length;
            var itemCount = 0;

            function getPreviewDetails(lineItem, order) {
                var denomination = lineItem.Product.Specs.Denomination ? lineItem.Product.Specs.Denomination.Value.replace('$', '') : null;
                var designID = "";
                var baseURL = "https://gca-svcs02-dev.cloudapp.net/ClientService/";
                //var serialURL = baseURL + "GetSerialNumber/" + denomination + "/usd/false/?";
                var serialURL = baseURL + "GetSerialNumber";
                $http.get(serialURL).success(function (serialNumber) {
                    var number = serialNumber.replace(/"/g, '');
                    if (lineItem.Product.Specs['SerialNumber']) lineItem.Product.Specs['SerialNumber'].Value = number;
                    if (lineItem.Product.Specs['DesignID']) {
                        var previewURL = baseURL + "LoadTemplatePreview?d=" + lineItem.Product.Specs['DesignID'].Value;
                        $http.post(previewURL).success(function (previewID) {
                            if (lineItem.Product.Specs['PreviewURL']) {
                                lineItem.Product.Specs['PreviewURL'].Value = "https://wopr-app-dev.gcincentives.com/ClientService/GetTemplatePreview/" + previewID.replace(/"/g, '');
                            }
                            itemCount++;
                            lineItem.Specs = angular.copy(lineItem.Product.Specs);

                            angular.forEach(lineItem.Specs, function(spec) {
                                if (spec.Value instanceof Date) {
                                    var tempDate = new Date(spec.Value);
                                    spec.Value = tempDate.getMonth()+1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear();
                                }
                            });

                            order.LineItems.push(lineItem);
                            if (recipCount == itemCount) {
                                success(order);
                            }
                        }).error(function(ex) {
                            if (lineItem.Product.Specs['PreviewURL'])
                                lineItem.Product.Specs['PreviewURL'].Value = null;
                            itemCount++;
                            lineItem.Specs = angular.copy(lineItem.Product.Specs);

                            angular.forEach(lineItem.Specs, function(spec) {
                                if (spec.Value instanceof Date) {
                                    var tempDate = new Date(spec.Value);
                                    spec.Value = tempDate.getMonth()+1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear();
                                }
                            });

                            order.LineItems.push(lineItem);
                            if (recipCount == itemCount) {
                                success(order);
                            }
                        });
                    }
                });
            }

            angular.forEach(selectedRecipients, function(recipient) {
                var lineItem = {};
                lineItem.Quantity = 1;
                User.get(function(user) {
                    lineItem.Product = recipientToSpecs(recipient, angular.copy(product), user);

                    lineItem.UniqueID = randomString();
                    lineItem.ShipAddressID = recipient.Address.ID;

                    getPreviewDetails(lineItem, order);
                });
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

        var _saveEmailAddress = function(temp, recipientList){
            angular.forEach(recipientList.List, function(recipient){
                if(recipient.UserID==temp.UserID){
                    recipient.EmailAddress = temp.EmailAddress;
                    recipient.BeingEdited = false;
                }
            });
            return this;
        };

        var _getTemplateThumbnails = function(product, success) {
            $http.get('https://gca-svcs02-dev.cloudapp.net/ClientService/GetTemplateThumbnails?s=' + product.ExternalID + '&o=1').
                success(function(data){
                    success(data);
                }).
                error(function(data, status, headers, config ) {
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                }
            );
        };

        return {
            getRecipients: _getRecipients,
            setRecipients: _setRecipients,
            clearRecipients: _clearRecipients,
            setProduct: _setProduct,
            getProduct: _getProduct,
            addToCartStatic: _addToCartStatic,
            addToCartVariable: _addToCartVariable,
            addRecipient: _addRecipient,
            removeRecipient: _removeRecipient,
            validateRecipientList: _validateRecipientList,
            setAddress: _setAddress,
            getTemplateThumbnails: _getTemplateThumbnails,
            saveEmailAddress: _saveEmailAddress
        }
    }]);