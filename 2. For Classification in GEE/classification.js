/*
1) Put the Geometry of training samples for the particular year from geometry.js file.
2) Insert the "gautam_buddhanagar.shp/shx/dbf" from "Assets" folder into your google earth engine assets and rename from default "table" to "boundary"
 */


/* 
3) Import the image_*year* asset from the "Assets" folder 
Bands selection and rename
*/
var image = image_1992
image = image.select(['b1', 'b2', 'b3', 'b4', 'b5', 'b6'])
                       .rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2']);
                       
/*
ADD NDVI, SAVI, NDWI and NDBI bands to the image
*/
var ndvi=image.expression('(NIR-Red)/(NIR+Red)',{
  'NIR':image.select('nir'),
  'Red':image.select('red')
})
  
var ndwi=image.expression('(Green-NIR)/(Green+NIR)',{
  'NIR':image.select('nir'),
  'Green':image.select('green')
})
  
var savi=image.expression('((NIR-Red)/(NIR+Red+0.5))*(1.0+0.5)',{
  'NIR':image.select('nir'),
  'Red':image.select('red')
})

var ndbi=image.expression('(SWIR1 - NIR)/(SWIR1 + NIR)',{
  'NIR':image.select('nir'),
  'SWIR1':image.select('swir1')
})

image = image.addBands(ndvi.rename('ndvi')).addBands(ndwi.rename('ndwi')).addBands(savi.rename('savi')).addBands(ndbi.rename('ndbi'));

print(image)

Map.addLayer(image.clip(boundary), {bands:['swir2', 'swir1', 'nir']}, 'FCC 1992');
Map.addLayer(image.clip(boundary), {bands:['nir', 'red', 'green']}, 'Standard FCC 1992');
Map.addLayer(image.clip(boundary), {bands:['red', 'green', 'blue']}, 'TCC 1992');
Map.addLayer(image.clip(boundary), {bands:['ndbi', 'ndvi', 'ndwi']}, 'Indices');

// ________________________ CLASSIFICATION _______________________________________________

var bands = ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'ndvi', 'ndwi', 'ndbi'];
var samples = WaterBodies.merge(Vegetation).merge(Barrenland).merge(Urban).merge(Cropland);

var total_sample = image.clip(boundary).select(bands).sampleRegions({
    collection:samples,
    properties:['id', 'name'],
    scale:30
  });
 
print(total_sample.size());

//Random Forest Classifier
var classifier= ee.Classifier.smileRandomForest(30).train({
  features: total_sample,
  classProperty: 'id',
  inputProperties: bands
});
/*
4) Rename "classification_1992" depending on the year selected above
*/
var classification_1992 = image.clip(boundary).select(bands).classify(classifier);
 
/*
["ff0000","1c33d6","fffd30","1ab631","ffb671"] 
color code for classified classes (builtup, water, cropland, vegetation, barren land/fallow land)
user can change the hex code in the whole script accordingly [optional]
*/
/*
5) REMOVE imageVisParam, 'Classified 1992' from the code below 
   Go to Layers in the Map interface and select the setting icon of Layer1 appearing
   Select "custom" is Range and input "1 to 5"
   Put the 5 palette colors in the sequence of hex code given above for each consecutive id of the LULC classes
   import the imageVisParam now in the code below with name of layer as 'Classified *year*' seperated by , sign 
*/
Map.addLayer(classification_1992.clip(boundary), imageVisParam, 'Classified 1992');

 
/* 
Accuracy assessment
Using smile.RandomForest() algorithm
Training  size = 75% of total sample size
Validation size = 25% of total sample size
Change the above parameters as required [optional]
*/

var sample_rc = total_sample.randomColumn('rand')
 
var training = sample_rc.filter(ee.Filter.lt('rand',0.75))
var validation = sample_rc.filter(ee.Filter.gte('rand',0.75))
 
print(validation.size());
var classifier= ee.Classifier.smileRandomForest(30).train({
  features: training,
  classProperty: 'id',
  inputProperties: bands
});

var confusionMatrix = ee.ConfusionMatrix(validation.classify(classifier).errorMatrix({
  actual:'id',
  predicted:'classification'
}))


//Print the confusion matrix, overall accuracy and kappa statistics
print('Confusion Matrix',confusionMatrix);
print('Overall Accuracy',confusionMatrix.accuracy());
print('Kappa', confusionMatrix.kappa());



/* 
6) Code to Export Image
   Change 'classification_1992' to 'classification_*your_particular_year' (2002,2013,2022) taken above
*/
Export.image.toDrive({
  image: classification_1992.clip(boundary),
  description: 'classification_1992',
  scale: 30,
  region: boundary,
  maxPixels: 1e13,
});


//Code to calculate the area of each class
for(var a = 1; a <= 5; a++){
  var x = classification_1992.clip(boundary).eq(a).multiply(ee.Image.pixelArea())
  var calculation = x.reduceRegion({
    reducer: ee.Reducer.sum(),
    scale: 30,
    maxPixels: 1e13
  })
 
  print('ID' + a + ' ' + 'km2', calculation, ee.Number(calculation.values().get(0)).divide(1e6));
}

//-------------------------------------------SVM Classifier--------------------------------------------
var classifier_svm= ee.Classifier.libsvm().train({
  features: total_sample,
  classProperty: 'id',
  inputProperties: bands
});

var classification_1992_svm = image_1992.clip(boundary).select(bands).classify(classifier_svm);
Map.addLayer(classification_1992_svm.clip(boundary), imageVisParam, 'Classified 1992 svm');

var svmClassifier = ee.Classifier.libsvm().train({
  features: training,
  classProperty: 'id',
  inputProperties: bands
});

var confusionMatrix_svm = ee.ConfusionMatrix(validation.classify(svmClassifier).errorMatrix({
  actual:'id',
  predicted:'classification'
}))

print('Confusion Matrix',confusionMatrix_svm);
print('Overall Accuracy',confusionMatrix_svm.accuracy());
print('Kappa', confusionMatrix_svm.kappa());


//-----------------------------------------END---------------------------------------------------------------

//-------------------------------------------CART Classifier--------------------------------------------
var classifier_cart= ee.Classifier.smileCart(10).train({
  features: total_sample,
  classProperty: 'id',
  inputProperties: bands
});

var classification_1992_cart = image_1992.clip(boundary).select(bands).classify(classifier_cart);
Map.addLayer(classification_1992_cart.clip(boundary), imageVisParam, 'Classified 1992 cart');

var cartClassifier = ee.Classifier.smileCart(10).train({
  features: training,
  classProperty: 'id',
  inputProperties: bands
});

var confusionMatrix_cart = ee.ConfusionMatrix(validation.classify(cartClassifier).errorMatrix({
  actual:'id',
  predicted:'classification'
}))

print('Confusion Matrix',confusionMatrix_cart);
print('Overall Accuracy',confusionMatrix_cart.accuracy());
print('Kappa', confusionMatrix_cart.kappa());


//-----------------------------------------END---------------------------------------------------------------
