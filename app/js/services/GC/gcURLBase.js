four51.app.factory('gcURL', function() {
    var service = {
        getBaseURL: _getBaseURL
    }

    var setEnvironment = 'dev';

    var baseURLs = {
        dev: 'https://wopr-app-dev.gcincentives.com/ClientService/',
        stage: 'https://wopr-app-stage.gcincentives.com/ClientService/'
    };

    function _getBaseURL() {
        return baseURLs[setEnvironment];
    }

    return service;
});
