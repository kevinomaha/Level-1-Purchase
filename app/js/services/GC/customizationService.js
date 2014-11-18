four51.app.factory('Customization', ['$451',
    function($451) {

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

        var _setProduct = function(product) {
            selectedProduct = product;
            selectedProduct.ProductType = productType(product);

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

        return {
            getEmployee: _getEmployee,
            setEmployee: _setEmployee,
            setProduct: _setProduct,
            getProduct: _getProduct,
            addToCart: _addToCart
        }
    }]);