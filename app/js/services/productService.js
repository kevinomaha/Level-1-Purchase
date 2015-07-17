four51.app.factory('Product', ['$resource', '$451', 'Security', function($resource, $451, Security) {
	//var _cacheName = '451Cache.Product.' + $451.apiName;
    var variantCache = [], productCache = [], criteriaCache;
	function _then(fn, data) {
		if (angular.isFunction(fn))
			fn(data);
	}

    var filteredSpecs = [
        "DesignName",
        "FutureShipDate",
        "Denomination",
        "EmailSubject",
        "OccasionMessage",
        "OpeningMessage",
        "PersonalMessage",
        "ClosingMessage",
        "DesignID",
        "PreviewURL",
        "SerialNumber",
        "OpeningPersonalization"
    ];

    var employeeSpecs = [
        "FirstName",
        "LastName",
        "RecipientID",
        "RecipientEmailAddress",
        "Email"
    ];

	function _extend(product) {
		product.ViewName = product.ViewName || 'default';
		angular.forEach(product.Specs, function(spec) {
			if (spec.ControlType == 'File' && spec.File && spec.File.Url.indexOf('auth') == -1) {
                spec.File.Url += "&auth=" + Security.auth();
            }
            spec.Filtered = filteredSpecs.indexOf(spec.Name) > -1;
            spec.ReadOnly = employeeSpecs.indexOf(spec.Name) > -1;
            spec.Required = spec.ReadOnly ? false : spec.Required;
            spec.Placeholder = spec.ReadOnly ? "Recipient's " + (spec.Label || spec.Name).replace(/[0-9]/g, '') : (spec.Label || spec.Name).replace(/[0-9]/g, '');
            spec.InputType = spec.Name.toLowerCase().indexOf('email') > -1 ? 'email' : 'text';
		});

		angular.forEach(product.StaticSpecGroups, function(group) {
			angular.forEach(group.Specs, function(spec) {
				if (spec.FileURL && spec.FileURL.indexOf('auth') == -1)
					spec.FileURL += "&auth=" + Security.auth();
			});
		});

        if(product.StaticSpecGroups){
            product.StaticSpecLength = 0;
            product.StaticSpecGroups.EvenSpecGroups = [];
            product.StaticSpecGroups.OddSpecGroups = [];
            angular.forEach(product.StaticSpecGroups, function(g){
                var visible = false;
                for (var i in g.Specs) {
                    if (g.Specs[i].VisibleToCustomer) {
                        visible = true;
                    }
                }
                if (visible) {
                    product.StaticSpecGroups.EvenSpecGroups.length == product.StaticSpecGroups.OddSpecGroups.length ? product.StaticSpecGroups.EvenSpecGroups.push(g) : product.StaticSpecGroups.OddSpecGroups.push(g);
                    product.StaticSpecLength++;
                }
            });
        }

        product.IsDigital = (product.Name.indexOf('Digital') > -1 || product.Name.indexOf('e-') > -1);
	}

    var _get = function(param, success, page, pagesize, searchTerm) {
        page = page || 1;
        pagesize = pagesize || 100;
        /*if (!angular.isUndefined(searchTerm)) {
            variantCache.splice(0, variantCache.length);
        }*/
        //var product = store.get(_cacheName + param);
        //product ? (function() { _extend(product);	_then(success, product); })() :
        var product = $resource($451.api('Products/:interopID'), { interopID: '@ID' }).get({ interopID: param, page: page || 1, pagesize: pagesize || 10, searchTerm: searchTerm }).$promise.then(function(product) {
            /*for (var i = 0; i <= product.VariantCount-1; i++) {
                if (typeof variantCache[i] == 'object') continue;
                variantCache[i] = product.Variants[i - (page - 1) * pagesize] || i;
            }
            product.Variants = variantCache;*/

            _extend(product);
            //store.set(_cacheName + product.InteropID, product);
            _then(success, product);
        });
    }

    var _search = function(categoryInteropID, searchTerm, relatedProductsGroupID, success, page, pagesize) {
        if(!categoryInteropID && !searchTerm && !relatedProductsGroupID){
            _then(success, null);
            return null;
        }

        var criteria = {
            'CategoryInteropID': categoryInteropID,
            'SearchTerms': searchTerm ? searchTerm : '',
            'RelatedProductGroupID': relatedProductsGroupID,
            'Page': page || 1,
            'PageSize': pagesize || 10
        };

        if (criteriaCache != criteria)
            productCache.splice(0, productCache.length);
        criteriaCache = criteria;

        //var cacheID = '451Cache.Products.' + criteria.CategoryInteropID + criteria.SearchTerms.replace(/ /g, "");
        //var products = store.get(cacheID);
        //products ? _then(success, products) :
        if (typeof productCache[(criteria.Page-1) * criteria.PageSize] == 'object' && typeof productCache[(criteria.Page * criteria.PageSize) - 1] == 'object') {
            _then(success, productCache, productCache.length);
        }
        else {
            $resource($451.api('Products')).get(criteria).$promise.then(function (products) {
                angular.forEach(products.List, _extend);
                for (var i = 0; i <= products.Count - 1; i++) {
                    if (typeof productCache[i] == 'object') continue;
                    productCache[i] = products.List[i - (((criteria.Page || 1) - 1) * (criteria.PageSize || 100))] || i;
                }
                _then(success, productCache, products.Count);
            });
        }
    }

    var _assemble = function(tree,success) {
        var productlist = [];

        for (var i = 0; i < tree.length; i++) {
            var categoryInteropID = tree[i].InteropID;

            _search(categoryInteropID,null,null,function(products) {
                for (var p = 0; p < products.length; p++) {
                    productlist.push(products[p]);
                }
            });
        }

        _then(success, productlist);
    }
	
	return {
        get: _get,
        search: _search,
        assemble: _assemble
    }
}]);
