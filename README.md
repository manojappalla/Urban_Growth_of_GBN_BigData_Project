# Urban_Growth_of_GBN(Gautam Buddha Nagar)_BigData_Project

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

*IMPORT REQUIRED FILES FROM THE ASSETS FOLDER INTO ASSETS OF GEE DEPENDING ON THE REQUIREMENT

/* classification.js */
This javascript file contains the code to apply random forest classification, to find the area of each class, and to export the classified image to google drive.

/* change detection.js */
This javascript file contains the code to perform change detection using the change matrix method and to calculate the area of class to class change. This also contains the code to export the image after performing the change detection

/* dashboard.js */
This code is used to create the dashboard

/* download.js */
This javascript file contains the code to filter the landsat collection and export the images by calculating the median of all the images in the collection.
