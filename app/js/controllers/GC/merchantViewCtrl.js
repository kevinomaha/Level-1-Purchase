'use strict';

four51.app.controller('MerchantViewCtrl', function ($routeParams, $sce, $scope, $451, $rootScope, $location, Category, Product, AdvancedSearch, User, Order, OrderConfig, Resources) {

    $scope.productLoadingIndicator = true;
	$scope.trusted = function(d){
		if(d) return $sce.trustAsHtml(d);
	}
	Product.search($routeParams.categoryInteropID, null, null, function(products) {
		var sortable = [];
		for (var i = 0; i < products.length; i++) {
			sortable.push([products[i], products[i].StandardPriceSchedule.PriceBreaks[0].Price])
		}
		sortable.sort(function(a,b) { return a[1] - b[1] });

		var sortedProducts = [];
		for (var j = 0; j < sortable.length; j++) {
			sortedProducts.push(sortable[j][0])
		}

        if (products.length < 10) {
            $scope.products = sortedProducts;
            $rootScope.$broadcast('event:MerchantProductSelected', $scope.products[0]);
        }
        else {
            var canadianUser = false;
            for (var i = 0; i < $scope.tree.length; i++) {
                canadianUser = $scope.tree[i].Name.indexOf('Canada') > -1 ? true : canadianUser;
            }
            $scope.searchResults = products;
            $scope.searchCategories = $scope.searchResults;
            if ($scope.searchResults.length > 0) { AdvancedSearch.createFilters($scope.searchResults,canadianUser); }
            AdvancedSearch.buildTree($scope.tree,$scope.searchCategories);
            AdvancedSearch.generateCategories($scope.searchCategories,$scope.tree);
        }

        //$rootScope.$broadcast('event:ProductSelected', $scope.products[0]);

		$scope.productLoadingIndicator = false;
    });
    if ($routeParams.categoryInteropID) {
	    $scope.categoryLoadingIndicator = true;
        Category.get($routeParams.categoryInteropID, function(cat) {
            $scope.currentCategory = cat;
            $rootScope.$broadcast('event:MerchantCategorySelected', $scope.currentCategory.SubCategories[0]);
	        $scope.categoryLoadingIndicator = false;
        });
    }else if($scope.tree){
		$scope.currentCategory ={SubCategories:$scope.tree};
        $scope.productLoadingIndicator = false;
    }

	$scope.$on("treeComplete", function(data){
		if (!$routeParams.categoryInteropID) {
			$scope.currentCategory ={SubCategories:$scope.tree};
		}
	});

    $scope.search = function(){
        $scope.searchResultsLoadingIndicator = true;
        $scope.currentCategory = null;
	    var canadianUser = false;
        for (var i = 0; i < $scope.tree.length; i++) {
            canadianUser = $scope.tree[i].Name.indexOf('Canada') > -1 ? true : canadianUser;
        }
        Product.search(null, $scope.searchTerm, null, function(products) {
            $scope.searchResults = products;
	        $scope.searchCategories = $scope.searchResults;
	        if ($scope.searchResults.length > 0) { AdvancedSearch.createFilters($scope.searchResults,canadianUser); }
	        AdvancedSearch.buildTree($scope.tree,$scope.searchCategories);
	        AdvancedSearch.generateCategories($scope.searchCategories,$scope.tree);
            $scope.searchResultsLoadingIndicator = false;
        });
    }

    $scope.clearSearch = function(){
        delete $scope.searchTerm;
        delete $scope.searchResults;
        $location.path('/catalog');
    }

	$scope.filterByMerchant = function(merchant) {
        $scope.searchResults.merchantFilter = merchant.indexOf('View All') > -1 ? '' : merchant;
		AdvancedSearch.countResults($scope.searchResults, $scope.searchResults.merchantFilter, $scope.searchResults.categoryFilter, $scope.searchResults.denomFilter);
	}

	$scope.filterByCategory = function(category) {
        $scope.searchResults.categoryFilter = category.indexOf('View All') > -1 ? '' : category;
		AdvancedSearch.countResults($scope.searchResults, $scope.searchResults.merchantFilter, $scope.searchResults.categoryFilter, $scope.searchResults.denomFilter);
	}

	$scope.filterByDenomination = function(denom) {
        $scope.searchResults.denomFilter = denom.indexOf('View All') > -1 ? null : denom + "dollars";
		AdvancedSearch.countResults($scope.searchResults, $scope.searchResults.merchantFilter, $scope.searchResults.categoryFilter, $scope.searchResults.denomFilter);
	}

    $scope.showMerchantList = true;

    $scope.selectCategory = function(category) {
        angular.forEach($scope.currentCategory.SubCategories, function(c) {
            c.selected = false;
        });
        category.selected = true;
        if (window.innerWidth < 1024){
            $scope.showMerchantList = false;
        }
        $rootScope.$broadcast('event:MerchantCategorySelected', category);
    }

	User.get(function(user) {
		$scope.user = user;

		var companyName = $scope.user.Company.Name.replace(/ /g,'').toLowerCase();
		$scope.homepage = "partials/HomePages/" + companyName + ".html";

		if (user.CurrentOrderID) {
			Order.get(user.CurrentOrderID, function(ordr) {
				$scope.currentOrder = ordr;
				OrderConfig.costcenter(ordr, user).address(ordr, user);
			});
		}
		else
			$scope.currentOrder = null;
	});

	$rootScope.$on('$event:GoHome', function(newValue, oldValue){
		$scope.clearSearch();
	});

    $rootScope.$on('event:BackToMerchantList', function(event){
        $scope.showMerchantList = true;
    });

//Banner rotation//
    $scope.carouselInterval = 5000;
    $scope.slides = [
        {image: 'http://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC Level 1 Redeem/Images/topseller.png', text: 'Top Sellers'},
        {image: 'http://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC Level 1 Redeem/Images/egift.png', text: 'Digital'},
        {image: 'http://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC Level 1 Redeem/Images/latest.png', text: 'Latest'}
    ];


});