four51.app.factory('Customization', ['$451', 'ProductDescription',
    function($451, ProductDescription) {

        var selectedEmployee = store.get('451Cache.SelectedEmployee') ? store.get('451Cache.SelectedEmployee') : {};
        var selectedProduct = store.get('451Cache.SelectedProduct') ? store.get('451Cache.SelectedProduct') : {};

        var _getEmployee = function() {
            return selectedEmployee;
        };

        var _setEmployee = function(employee) {
            selectedEmployee = employee;
            store.set('451Cache.SelectedEmployee', employee);
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

        return {
            getEmployee: _getEmployee,
            setEmployee: _setEmployee,
            setProduct: _setProduct,
            getProduct: _getProduct,
            addToCart: _addToCart,
            employeeToSpecs: _employeeToSpecs
        }
    }]);