four51.app.factory('CategoryDescription', function() {
	function _parse(category) {
		if (category.SubCategories.length == 0 && category.Description != "") {

			category.SpaDescription = {};

			categoryDescription = $(category.Description);

			var img = "http://www.four51.com/Themes/Custom/" + $(categoryDescription).find("img").attr("src").split("../../")[1];

			var description = $(categoryDescription).find('p:first').text();
			if (description == "") {
				description = $(categoryDescription).find('p:eq(1)').text();
			}

			var infoTab = $(categoryDescription).find("#infoDiv0 p").text();

			$(categoryDescription).find("#infoDiv1 div #handlingFee").text("2.50 ");
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
				categoryDescription = $(category.Description);
                var image = "http://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC Level 1 Redeem/images/" + category.Description.split('images')[1].replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '').replace(/ /g,'').replace('.jpgalt','.jpg');
				category.topLevelCatImg = image;
			}
		}
	}

	return {
		parse: _parse
	}
});