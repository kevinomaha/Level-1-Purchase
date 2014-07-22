four51.app.factory('CategoryDescription', function() {
    function _parse(category) {
        if (category.SubCategories.length == 0 && category.Description != "") {

            category.SpaDescription = {};

            category.Description = category.Description.replace(/<img/g,"<span"); //jQuery select will attempt to load image tags, resulting in 404
            var categoryDescription = $(category.Description);

            //Find image without jQuery select to avoid 404 images
            var img = "https://www.four51.com/Themes/Custom/" + category.Description.split('../../')[1].split('.jpg')[0] + ".jpg";

            var description = "";
            var textFound = false;
            $(categoryDescription).find('tbody tr > td').contents().each(function() {
                if (this.nodeName == '#text' && !textFound) {
                    textFound = true;
                    description += "<p>" + $(this).text() + "</p>";
                }
            });
            $(categoryDescription).find('p').each(function() {
                if ($(this).html().indexOf('handlingFee') == -1 && $(this).html().indexOf('infoDiv0') == -1
                    && $(this).html().indexOf('infoDiv1') == -1 && $(this).html().indexOf('infoDiv2') == -1
                    && $(this).parent('div').prop('class') != 'infoPanel') {
                    description += "<p>" + $(this).text() + "</p>";
                }
            });

            if (description == "") {
                if ($(categoryDescription).find('td:last').text()) {
                    description +=$(categoryDescription).find('td:last').text();
                }
            }

            /*var infoTab = $(categoryDescription).find("#infoDiv0 p").text();*/
            var infoTab = "";

            $(categoryDescription).find("#infoDiv0 p").each(function() {
                infoTab += $(this).html();
            });

            if ($(categoryDescription).find("#infoDiv1 div #handlingFee").length > 0) {
                $(categoryDescription).find("#infoDiv1 div #handlingFee").text("2.50 ");
            }
            else if ($(categoryDescription).find("#infoDiv1 div").length > 0) {
                $(categoryDescription).find("#infoDiv1 div").html($(categoryDescription).find("#infoDiv1 div").html().replace('$','$2.50'));
            }

            var handlingTab = $(categoryDescription).find("#infoDiv1 div").html();

            var canadianTab = $(categoryDescription).find("#infoDiv2 div").html();

            category.SpaDescription.image = img;
            category.SpaDescription.description = description;
            category.SpaDescription.infoTab = infoTab;
            category.SpaDescription.handlingTab = handlingTab;
            if (canadianTab) {
                category.SpaDescription.canadianTab = canadianTab;
            }
        }
        else {

            if (category.Description.toString().indexOf('<img') > -1) {
                category.Description = category.Description.replace(/<img/g,"<span"); //jQuery select will attempt to load image tags, resulting in 404
                categoryDescription = $(category.Description);
                var image = "https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC Level 1 Redeem/images/" +
                    category.Description.split('images')[1].replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '').replace(/ /g,'').replace('.jpgalt','.jpg');
                category.topLevelCatImg = image;
            }
        }
    }

    return {
        parse: _parse
    }
});