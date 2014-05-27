four51.app.factory('AdvancedSearch', ['Resources', 'Category', 'CategoryDescription',
function(Resources,Category,CategoryDescription) {
	function _createFilters(searchResults,canadianUser) {
		var merchants = ['View All Merchants'];
		var categories = ['View All Categories'];
		var denominations = [];
		var productCategories = Resources.productCategories;

		angular.forEach(searchResults, function(p) {
			p.categories = [];
			var merchantName = p.Name.split(' $')[0].replace('.com','').replace(/(®)/,'');
			p.merchantName = merchantName;
			if (merchants.indexOf(merchantName) == -1) {
				merchants.push(merchantName);
			}
			var denom = p.Name.split("$")[1].match(/\d+/g)[0];
			p.denom = "$" + denom + "dollars";
			if (denominations.indexOf(denom) == -1) {
				denominations.push(denom);
			}
			for (var cat in productCategories) {
				if (productCategories[cat].indexOf(merchantName) > -1) {
					p.categories.push(cat);
					if (categories.indexOf(cat) == -1 && cat.indexOf('Canada') > -1 && canadianUser) {
						categories.push(cat);
					}
					else if (categories.indexOf(cat) == -1 && cat.indexOf('Canada') == -1) {
						categories.push(cat);
					}
				}
			}
		});

		denominations = denominations.sort(function(a,b){return a-b});
		for (i =0; i < denominations.length; i++) {
			denominations[i] = "$" + denominations[i];
		}

        denominations.unshift('View All Denominations');

		searchResults.merchants = merchants;
		searchResults.categories = categories;
		searchResults.denominations = denominations
	}

	function _countResults(searchResults, merchantFilter, categoryFilter, denomFilter) {
		var resultCount = 0;
		angular.forEach(searchResults, function(r) {
			if (merchantFilter && categoryFilter && denomFilter) {
				if (r.merchantName == merchantFilter && r.categories.indexOf(categoryFilter) > -1 && r.denom == denomFilter) {
					resultCount++;
				}
			}
			else if (merchantFilter && categoryFilter) {
			    if (r.merchantName == merchantFilter && r.categories.indexOf(categoryFilter) > -1) {
				    resultCount++;
			    }
			}
			else if (merchantFilter && denomFilter) {
				if (r.merchantName == merchantFilter && r.denom == denomFilter) {
					resultCount++;
				}
			}
			else if (categoryFilter && denomFilter) {
				if (r.categories.indexOf(categoryFilter) > -1 && r.denom == denomFilter) {
					resultCount++;
				}
			}
			else if (merchantFilter) {
				 if (r.merchantName == merchantFilter) {
					 resultCount++;
				 }
			}
			else if (categoryFilter) {
				 if (r.categories.indexOf(categoryFilter) > -1) {
					 resultCount++;
				 }
			}
			else if (denomFilter) {
				if (r.denom == denomFilter) {
					resultCount++;
				}
			}
			else {
				resultCount = searchResults.length;
			}
		});
		searchResults.resultCount = resultCount;
	}

	function _build(tree,results) {

		var categories = [];

		for (var i = 0; i < tree.length; i++) {
			for (var j = 0; j < tree[i].SubCategories.length; j++) {
				var simpleName = tree[i].SubCategories[j].Name.replace(' e-Gift Card','').replace('.com','').replace(/(®)/,'');
				categories[simpleName] = tree[i].SubCategories[j].InteropID;
			}
		}

		results.tree = categories;
	}

	function _generate(searchCats,rootTree) {

		//tree is $scope.searchCategories
		categories = [];
		var interopIDs = [];

		for (var i = 0; i < searchCats.length; i++) {
			var merchant = searchCats[i].merchantName;
			var categoryInteropID = searchCats.tree[merchant];
			if (interopIDs.indexOf(categoryInteropID) == -1) {
				interopIDs.push(categoryInteropID);
				for (var c = 0; c < rootTree.length; c++) {
					for (var sc = 0; sc < rootTree[c].SubCategories.length; sc++) {
						if (rootTree[c].SubCategories[sc].InteropID == categoryInteropID) {
							cat = rootTree[c].SubCategories[sc];
							CategoryDescription.parse(cat);
							cat.products = [];
							for (var p = 0; p < searchCats.length; p++) {
								if (searchCats[p].merchantName == merchant) {
									cat.products.push(searchCats[p]);
									cat.merchant = merchant;
								}
							}

							var sortable = [];
							for (var s = 0; s < cat.products.length; s++) {
								sortable.push([cat.products[s], cat.products[s].StandardPriceSchedule.PriceBreaks[0].Price])
							}
							sortable.sort(function(a,b) { return a[1] - b[1] });

							var sortedProducts = [];
							for (var z = 0; z < sortable.length; z++) {
								sortedProducts.push(sortable[z][0])
							}

							cat.products = sortedProducts;

							categories.push(cat);
						}
					}
				}
			}
		}

		searchCats.displayCategories = categories;
	}


	return {
		createFilters: _createFilters,
		countResults: _countResults,
		buildTree: _build,
		generateCategories: _generate
	}
}]);