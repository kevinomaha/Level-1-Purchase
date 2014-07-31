four51.app.factory('User', ['$q', '$rootScope', '$resource', '$451', 'Security', 'Error', function($q, $rootScope, $resource, $451, Security, Error) {
    var _cacheName = '451Cache.User.' + $451.apiName;
	function _then(fn, data) {
        if (angular.isFunction(fn))
            fn(data);
    }

    function _extend(u) {
		u.Permissions.contains = function(value) {
            return $451.contains(u.Permissions, value);
        };
        if ($451.contains(u.Permissions, ['PayByVisa', 'PayByMasterCard', 'PayByAmex', 'PayByDiscover', 'PayByDinersClub', 'PayByJCB', 'PayByDelta', 'PayBySwitch', 'PayBySolo', 'PayByElectron', 'PayByLaser']))
            u.Permissions.push('PayByCreditCard');

        if (!u.AvailableCreditCards || u.AvailableCreditCards.length == 0) {
            u.AvailableCreditCards = [];
            $451.contains(u.Permissions, ['PayByVisa']) ? u.AvailableCreditCards.push({Type:'Visa',DisplayName:'Visa'}) : null;
            $451.contains(u.Permissions, ['PayByMasterCard']) ? u.AvailableCreditCards.push({Type:'MasterCard',DisplayName:'MasterCard'}) : null;
            $451.contains(u.Permissions, ['PayByAmex']) ? u.AvailableCreditCards.push({Type:'AmericanExpress',DisplayName:'American Express'}) : null;
            $451.contains(u.Permissions, ['PayByDiscover']) ? u.AvailableCreditCards.push({Type:'Discover',DisplayName:'Discover'}) : null;
        }

	    angular.forEach(u.CustomFields, function(f) {
			if (f.ControlType == 'File' && f.File && f.File.Url.indexOf('auth') == -1)
				f.File.Url += "&auth=" + Security.auth();
	    });
	    u.Company.POIDMask = u.Company.POIDMask.toUpperCase();
    }

	var _refresh = function() {
		store.remove(_cacheName);
		_get();
	}

    var _get = function(success) {
        var user = store.get(_cacheName);
	    user ? (function() { _extend(user); _then(success,user); })() :
            $resource($451.api('user')).get().$promise.then(function(u) {
                _extend(u);
                _then(success,u);
                store.set(_cacheName, u);
            });
    }

    var _save = function(user, success, error) {
        $resource($451.api('user')).save(user).$promise.then(
	        function(u) {
                _extend(u);
                _then(success,u);
                store.set(_cacheName, u);
            },
	        function(ex) {
		        if (angular.isFunction(error))
			        error(Error.format(ex));
	        }
        );
    }

    var _login = function(credentials, success, error) {
	    store.clear();
        $resource($451.api('login')).get(credentials).$promise.then(
	        function(u) {
                _then(success,u);
	        },
	        function(ex) {
		        if (angular.isFunction(error))
			        error(Error.format(ex));
	        }
        );
    }

    var _logout = function() {
        store.clear();
        Security.logout();
    }

    return {
        get: _get,
        login: _login,
        save: _save,
        logout: _logout,
	    refresh: _refresh
    };
}]);