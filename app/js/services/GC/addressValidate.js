four51.app.factory('AddressValidate', ['$resource', function($resource) {

    var baseUrl = "https://gca-svcs02-dev.cloudapp.net/ClientService/ValidateAddress";

    function identicalAddresses(uA, rA) {
        //uA = User's Address
        //rA = Returned Address
        var result = false;
        if ((uA.Street1 == rA.AddressLine1) && (!uA.Street2 || uA.Street2 == rA.AddressLine2) && (uA.City == rA.City) && (uA.State == rA.State) && (uA.Country == rA.Country) && (uA.Zip.substr(0,5) == rA.Zip.substr(0,5))) {
            result = true;
        }
        return result;
    }

    function _validate(address, success, error) {
        var originalAddress = angular.copy(address);
        var addressObj = {
            "a1": address.Street1,
            "a2": address.Street2,
            "c": address.City,
            "s": address.State,
            "z": address.Zip,
            "co": address.Country
        };

        $resource(baseUrl, {}).get(addressObj).$promise.then(function(data) {
                if (data.AddressStatus == 'Valid') {
                    if (identicalAddresses(originalAddress, data)) {
                        originalAddress.status = "Valid";
                        success(originalAddress);
                    }
                    else {
                        originalAddress.status = "ValidWithRecommendation";
                        var newAddress = {
                            AddressName: originalAddress.AddressName,
                            FirstName: originalAddress.FirstName,
                            LastName: originalAddress.LastName,
                            CompanyName: originalAddress.CompanyName,
                            IsShipping: (originalAddress.IsShipping || false),
                            IsBilling: (originalAddress.IsBilling || false),
                            Street1: data.AddressLine1,
                            Street2: data.AddressLine2,
                            City: data.City,
                            State: data.State,
                            Zip: data.Zip,
                            Country: data.Country,
                            Phone: originalAddress.Phone
                        };
                        success(originalAddress, newAddress);
                    }
                }
                else {
                    originalAddress.status = "Invalid";
                    success(originalAddress);
                }
            },
            function(ex) {
                console.log(ex);
            });

        /*//Prepare yql address validate query
         var yqlQuery = encodeURIComponent(
         "use \"https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC_Main/general_theme/scripts/htmlpost_table.xml\" as htmlpost;\
         select * from htmlpost where\
         url=\"https://business1.giftcertificates.com/webservice/wsorder.asmx\"\
         and postdata=\"<?xml version='1.0' encoding='utf-8'?>\
         <soap12:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap12='http://www.w3.org/2003/05/soap-envelope'>\
         <soap12:Header>\
         <WebServiceCredentials xmlns='http://www.giftcertificates.com/WebService/'>\
         <ApiClientId>63</ApiClientId>\
         <ApiClientPassword>Cmdr1nCh1ef1</ApiClientPassword>\
         <HostSystemUserName>string</HostSystemUserName>\
         <UserSourceIPAddress>string</UserSourceIPAddress>\
         <OperationMode>Normal</OperationMode>\
         <CertificationTestId>0</CertificationTestId>\
         </WebServiceCredentials>\
         </soap12:Header>\
         <soap12:Body>\
         <Address_Validate xmlns='http://www.giftcertificates.com/WebService/'>\
         <address>\
         <Street1>" + (address.Street1 || "") + "</Street1>\
         <Street2>" +  (address.Street2 || "") + "</Street2>\
         <City>" +  (address.City || "") + "</City>\
         <State>" +  (address.State || "") + "</State>\
         <Zip>" +  (address.Zip || "") + "</Zip>\
         </address>\
         </Address_Validate>\
         </soap12:Body>\
         </soap12:Envelope>\" and xpath=\"*\""
         );

         var handlers = {
         "Success": function(address,$response,addressValidateExactMatch,addressResponse) {
         //Valid
         if (addressValidateExactMatch) {
         address.status = 'Valid';
         success(address);
         }
         //Recommendation
         else {
         address.status = 'ValidWithRecommendation';
         var newAddress = {};
         newAddress.AddressName = address.AddressName;
         newAddress.City = $response.find("City").text();
         newAddress.CompanyName = address.CompanyName;
         newAddress.FirstName = address.FirstName;
         newAddress.LastName = address.LastName;
         newAddress.IsShipping = (address.IsShipping || false);
         newAddress.IsBilling = (address.IsBilling || false);
         newAddress.Phone = address.Phone;
         newAddress.Street1 = $response.find("Street1").text();
         newAddress.Street2 = $response.find("Street2").text();
         newAddress.State = $response.find("State").text();
         newAddress.Zip = $response.find("Zip").text();
         newAddress.Country = address.Country;

         success(address,newAddress);
         }
         },
         "InvalidAddress": function(address) {
         address.status = "Invalid";
         success(address);
         },
         "Empty": function(address) {
         address.status = "Invalid";
         success(address);
         },
         "Error": function(address,addressResponse) {
         address.status = "Error";
         address.response = addressResponse.find("ResultText").text();
         success(address);
         }
         };



         $.getJSON("https://query.yahooapis.com/v1/public/yql?q=" + yqlQuery + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=?")
         .success(function (data) {
         var responseXML = $.parseXML(data.results[0]);
         var $response = $(responseXML);

         var addressValidateResultCode = $response.find("ResultCode").text();
         var addressValidateExactMatch = $response.find("IsExactMatch").text();
         var addressValidateResponse = $response.find("ResultText").text();

         handlers[addressValidateResultCode || "Empty"](address,$response,addressValidateExactMatch,addressValidateResponse);
         })
         .error(function (xhr, ajaxOptions, thrownError) {
         error("error occurred");
         //Call validate again
         *//*if (callCount < 5) {
         validateAddress(callCount + 1);
         }  *//*
         });*/
    }

    return {
        validate: _validate
    }
}]);