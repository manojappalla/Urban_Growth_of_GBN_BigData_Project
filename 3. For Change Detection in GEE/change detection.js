// Set a center and zoom level.
Map.setCenter(77.52, 28.38, 10);
// *********************************************************

/*
1) Insert the "gautam_buddhanagar.shp/shx/dbf" from "Assets" folder into your google earth engine assets and rename from default "table" to "boundary"
2) Insert "image_classified_1992", "image_classified_2002", "image_classified_2013", "image_classified_2022" from om "Assets" folder into your google earth engine assets and rename them to same name
2) Change "image_classified_1992" and "image_classified_2002" to your required "previous_year" and "next_year" respectively for change detection
 */
var previous_year = image_classified_1992;
var next_year = image_classified_2002;
var changed_image = previous_year.multiply(10).add(next_year);
// Add Changed Image to Map
/*
5) REMOVE imageVisParam, 'Classified 1992' from the code below 
   Go to Layers in the Map interface and select the setting icon of Layer1 appearing
   Select "custom" is Range and input "11 to 55"
   import the imageVisParam now in the code below 
*/
Map.addLayer(changed_image.clip(boundary),imageVisParam);

// Calculate change in areas from class to class between two consecutive decades for example 11 = Urban-Urban change, 21 = Waterbodies-Urban change.
// The ids given for the classes Urban, Waterbodies, Cropland, Vegetation, and Barren/Fallow Land are 1,2,3,4, and 5 respectively.
// That's why we get 11-55 in the image after performing change detection.
for(var a = 11; a <= 55; a++){
  var x = changed_image.eq(a).multiply(ee.Image.pixelArea());
  var calculation = x.reduceRegion({
    reducer: ee.Reducer.sum(),
    scale: 30,
    maxPixels: 1e13

  });
  
  print('ID' + a + ' ' + 'km2', calculation, ee.Number(calculation.values().get(0)).divide(1e6));
}

//Export Changed_Image 
Export.image.toDrive({
  image: changed_image.toInt(),
  description: 'changed_image',
  scale: 30,
  region: boundary,
  maxPixels: 1e13,
});