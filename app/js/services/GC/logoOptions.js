four51.app.factory('LogoOptions', function() {
    var logooptions = [];
    function _getlogos(username) {
        if(window.location.href.indexOf("-stage") > -1 || window.location.href.indexOf("test.four51.com") > -1) {
            var webServiceURL = 'https://cte1.giftcertificates.com/webservice/wsorder.asmx';
            var webServicePassword = 'V1c3Pr3z1';
        }
        else {
            var webServiceURL = 'https://business1.giftcertificates.com/webservice/wsorder.asmx'
            var webServicePassword = 'Cmdr1nCh1ef1';
        }
        var yqlQuery = encodeURIComponent(
            "use \"https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC_Main/general_theme/scripts/htmlpost_table.xml\" as htmlpost;\
            select * from htmlpost where\
            url='" + webServiceURL + "'\
                  and postdata=\"<?xml version='1.0' encoding='utf-8'?>\
                  <soap12:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap12='http://www.w3.org/2003/05/soap-envelope'>\
                    <soap12:Header>\
                      <WebServiceCredentials xmlns='http://www.giftcertificates.com/WebService/'>\
                        <ApiClientId>63</ApiClientId>\
                        <ApiClientPassword>" + webServicePassword + "</ApiClientPassword>\
                        <HostSystemUserName></HostSystemUserName>\
                        <UserSourceIPAddress></UserSourceIPAddress>\
                        <OperationMode>Normal</OperationMode>\
                        <CertificationTestId>0</CertificationTestId>\
                      </WebServiceCredentials>\
               </soap12:Header>\
               <soap12:Body>\
                  <RetrieveLogos xmlns='http://www.giftcertificates.com/WebService/'>\
                     <fileType>DigitalLogo</fileType>\
                     <four51UserName>" + username + "</four51UserName>\
                  </RetrieveLogos>\
               </soap12:Body>\
            </soap12:Envelope>\" and xpath=\"*\""
        );

        var jsonpResponse = false;
        var searchResult = "";
        var searchResultText = "";
        var searchResults = new Object();
        var showlogooptions = false;

        $.getJSON("https://query.yahooapis.com/v1/public/yql?q=" + yqlQuery + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=?")
            .success(function (data) {
                var responseXML = $.parseXML(data.results[0]);
                var $response = $(responseXML);

                searchResult = $response.find("ResultCode:first").text();
                searchResultText = $response.find("ResultText,resultText").first().text(); //Empty results are lowercase for some reason...
                searchResults = $response.find("LogoResult");
                jsonpResponse = true;

                $(searchResults).each(function(index) {
                    logooptions.push({"name":$(this).find("LogoName").text(),"path":$(this).find("FilePath").text(),"fileID":$(this).find("FileID").text()});
                });

                if (logooptions.length > 0) {
                    showlogooptions = true;
                };
            });
    }

    return {
        getlogos: _getlogos,
        logooptions: logooptions
    }
});