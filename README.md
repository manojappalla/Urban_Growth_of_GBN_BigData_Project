# Urban_Growth_of_GBN(Gautam Buddha Nagar)_BigData_Project

PROJECT INTRODUCTION:
This project shows the decadal urban growth of Gautam Buddha Nagar district of UP. This project, right from fetching the images to performing classification, change detection, and dashboard has been executed on the Google Earth Engine. 

METHODOLOGY EXECUTED:
1) Load the image colloection by filtering with respect to the boundary, cloud cover, and date (1992-01-31 to 1992-12-31) and similar is done for 2002, 2013, and 2022). For 1992, Landsat-5 Collection-2 Tier-1 was used, for 2002, Landsat-7 Collection-2 Tier-1, and for 2013 and 2022, Landsat-8 Collection-2 Tier-1 image collection was used.
2) Next create an image composite using median as measure to remove the effect of cloud cover and store it in a new variable for each image collection loaded in the step 1. These images were again exported to drive for contrast enhancement in QGIS.
3) The exported images were imported back to the google cloud assets. The bands were renamed and new bands that are indices were added to the image to use in the process of classification.
4) Then the training samples were collected for Urban, Waterbodies, Cropland, Vegetation, and Barren/Fallow land and are fed to the random forest         classifier to perform classification, and the area for each class is calculated.
5) Then the change detection is performed on these classified images using the following formula:
   change_image = 1992_image * 10 + 2002_image.
   The above formula has been applied for the consecutive decades i.e., 1992-2002, 2002-2013, 2013-2022 also.
6) The areas of class to class change generated for the above 3 images has been found and were shown in the form of graphs in the dashboard.
7) Then the dashboard has been created within the google earth engine and has been published as an earth engine app.

SCALABILITY OF THE PROJECT:
If one has to replicate this to another area:
Note:
1) Can change the boundary
2) Can change image collection within the Landsat or some other satellite image collection can be chosen (Acoordingly the scale should be adjusted)
3) If choosing an algorithm other than smileRandomForest, look for the documentation of google earth engine to find out how to use the chosen algorithm.

"Assets" folder:
1) 1992_to_2002.tif shows the decadal change between the years 1992-2002
2) 2002_to_2013.tif shows the decadal change between the years 2002-2013
3) 2013_to_2022.tif shows the decadal change between the years 2013-2022
4) image_classified_1992.tif is the classified LULC image of 1992
5) image_classified_2002.tif is the classified LULC image of 2002
6) image_classified_2013.tif is the classified LULC image of 2013
7) image_classified_2022.tif is the classified LULC image of 2022
8) legend_1992_2002.tif, legend_2002_2013.tif, and legend_2013_2022.tif shows the legends for the images showing decadal change.
9) the "gautam_buddhanagar.shp/shx/dbf" is the boundary shapefile of the district.

*IMPORT REQUIRED FILES FROM THE ASSETS FOLDER INTO ASSETS OF GOOGLE EARTH ENGINE DEPENDING ON THE REQUIREMENT

/* classification.js */
This javascript file contains the code to apply random forest classification, to find the area of each class, and to export the classified image to google drive.

/* change detection.js */
This javascript file contains the code to perform change detection using the change matrix method and to calculate the area of class to class change. This also contains the code to export the image after performing the change detection

/* dashboard.js */
This code is used to create the dashboard

/* download.js */
This javascript file contains the code to filter the landsat collection and export the images by calculating the median of all the images in the collection.
