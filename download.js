/*
1) Insert the "gautam_buddhanagar.shp/shx/dbf" from "Assets" folder into your google earth engine assets and rename from default "table" to "boundary"
*/ 


// Load the image collections for 1992, 2002, 2013, and 2022 by filtering them with respect to date, cloud cover, and boundary.

var dataset_1992 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .filterDate('1992-01-01', '1992-12-31')
    .filterMetadata('CLOUD_COVER', 'less_than', 10)
    .filterBounds(boundary);
    
var dataset_2002 = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
    .filterDate('2002-01-01', '2002-12-31')
    .filterMetadata('CLOUD_COVER', 'less_than', 10)
    .filterBounds(boundary);
    
var dataset_2013 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterDate('2013-03-18', '2013-12-31')
    .filterMetadata('CLOUD_COVER', 'less_than', 10)
    .filterBounds(boundary);   

var dataset_2022 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterDate('2022-01-01', '2022-04-20')
    .filterMetadata('CLOUD_COVER', 'less_than', 10)
    .filterBounds(boundary);

// APPLY SCALING FACTORS

function applyScaleFactors_1992(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true);
}

function applyScaleFactors_2002(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}


function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

// Use map function to apply a function on all the images of a collection

dataset_1992 = dataset_1992.map(applyScaleFactors_1992); 
dataset_2002 = dataset_2002.map(applyScaleFactors_2002);
dataset_2013 = dataset_2013.map(applyScaleFactors);
dataset_2022 = dataset_2022.map(applyScaleFactors);


// MEDIAN IMAGES
var image_1992 = dataset_1992.median();
var image_2002 = dataset_2002.median();
var image_2013 = dataset_2013.median();
var image_2022 = dataset_2022.median();

// RENAME BAND NAMES TO AVOID CONFUSION

image_1992 = image_1992.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'])
                       .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']);
                       
image_2002 = image_2002.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'])
                       .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']);
                       
image_2013 = image_2013.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'])
                       .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']);
                       
image_2022 = image_2022.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'])
                       .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']);
                                         
// EXPORT IMAGES

Export.image.toDrive({
  image: image_1992.clip(boundary),
  description: 'image_1992',
  region: boundary,
  scale: 30,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: image_2002.clip(boundary),
  description: 'image_2002',
  region: boundary,
  scale: 30,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: image_2013.clip(boundary),
  description: 'image_2013',
  region: boundary,
  scale: 30,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: image_2022.clip(boundary),
  description: 'image_2022',
  region: boundary,
  scale: 30,
  maxPixels: 1e13
});