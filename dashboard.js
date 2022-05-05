/*
Import the following assets from "Assets" folder with the following names
1) Rename 1992_to_2002 to change_1992_2002
2) Rename 2002_to_2013 to change_2002_2013
3) Rename 2013_to_2022 to change_2013_2022
4) Rename image_classified_1992 to classified_1992
5) Rename image_classified_2002 to classified_2002
6) Rename image_classified_2013 to classified_2013
7) Rename image_classified_2022 to classified_2022
8) Import legend_1992_2002, legend_2002_2013, and legend_2013_2022 and don't rename
9) Insert the "gautam_buddhanagar.shp/shx/dbf" from "Assets" folder into your google earth engine assets and rename from default "table" to "boundary"
*/


/**  PARAMETERS AND FUNCTIONS USED IN THE PROGRAM **/

// Visualization Parameters To View The LULC Image and LULC change detection image
var imageVisParam = {"opacity":1,"bands":["b1"],"min":1,"max":5,"palette":["ff0000","1c33d6","fffd30","1ab631","ffb671"]}
var imageVisParam_change = {"opacity":1,"bands":["b1","b2","b3"],"gamma":1};

/* ARRAYS OF AREAS OF EACH CLASS FOR EVERY YEAR */ 
var areas_1992 = [63.247, 50.701, 183.371, 253.918, 834.897]
var areas_2002 = [192.300, 22.638, 494.461, 265.656, 411.079]
var areas_2013 = [288.206, 77.498, 469.142, 153.257, 399.409]
var areas_2022 = [432.003, 21.356, 659.427, 198.330, 75.018]
var class_names = ['Urban', 'Waterbodies', 'Cropland', 'Vegetation', 'Barren/Fallow Land']

/* CHANGE DETECTION AREAS FROM OTHER CLASSES TO URBAN */
var area_change_classes = ['Urban-Urban', 'Waterbodies-Urban', 'Cropland-Urban', 'Vegetation-Urban', 'Barren/Fallow land-Urban']
var area_change_1992_2002 = [30.62, 12.36, 9.53, 14.19, 126.08]
var area_change_2002_2013 = [90.26, 3.29, 55.15, 38.08, 100.81]
var area_change_2013_2022 = [189.62, 21.27, 63.27, 20.58, 137.54]

/* PANEL FOR LEGEND OF LULC */
var legend_panel =ui.Panel({
  style:{
    position : 'bottom-left',
    padding : '5px'
  }
})

// Add Legend title to the panel and add that legend to the panel
var legend_title = ui.Label({
  value: "LULC",
  style: {
    fontSize: '14px',
    fontWeight: 'bold',
    margin : '0px'
  }
})
legend_panel.add(legend_title)

// Give the hex color codes of the respective classes
var color = ["1c33d6","ff0000","1ab631","fffd30","ffb671"]
var classified_class= ['Water Body', 'Urban', 'Vegetation', 'Crop Land', 'Barren/Fallow Land'] 

// Function to add the legend items to the panel
var list_legend = function(color,description){
  var c = ui.Label({
    style: {
      backgroundColor: color,
      padding: '10px',
      margin: '4px'
    }
  })
  var ds = ui.Label({
    value: description,
    style: {
      margin: '4px'
    }
  })
  return ui.Panel({
    widgets: [c, ds],
    layout: ui.Panel.Layout.Flow('horizontal')
  })
}

for(var a = 0; a <5; a++){ // Increase the number of iterations depending on the number of classes in the classified image
  legend_panel.add(list_legend(color[a], classified_class[a])) // add each color and the class name to the legend 
}

/* PANEL FOR LEGEND OF CHANGE DETECTION */
var legend_change_panel =ui.Panel({
  style:{
    position : 'bottom-left',
    padding : '5px'
  }
});

function create_logo(image){  // Function to create a logo from an image
  var logo = ee.Image(image).visualize({
    bands:  ['b1', 'b2', 'b3'],
    min: 0,
    max: 255
    });
  return logo
}
    
function create_thumbnail(image){ // function which takes logo as an argument and returns a thumbnail
  var thumb = ui.Thumbnail({
    image: image,
    params: {
        dimensions: '642x291',
        format: 'png'
        },
    style: {height: '127px', width: '280px',padding :'0'}
    });
  return thumb
}

// Create logo and thumbnail for all the images for which change detection is performed
var logo_1992_2002 = create_logo(legend_1992_2002)
var thumb_1992_2002 = create_thumbnail(logo_1992_2002)
var logo_2002_2013 = create_logo(legend_2002_2013);
var thumb_2002_2013 = create_thumbnail(logo_2002_2013);
var logo_2013_2022 = create_logo(legend_2013_2022);
var thumb_2013_2022 = create_thumbnail(logo_2013_2022);




/* LULC IMAGES DICTIONARY FOR SELECTION WIDGET */
var lulc = {
  'LULC 1992': classified_1992,
  'LULC 2002': classified_2002,
  'LULC 2013': classified_2013,
  'LULC 2022': classified_2022
};

/* LULC CHANGE DETECTION IMAGES DICTIONARY FOR SELECTION WIDGET */
var lulc_change = {
  'LULC 1992-2002': change_1992_2002,
  'LULC 2002-2013': change_2002_2013,
  'LULC 2013-2022': change_2013_2022,
};

/* CREATE OPTIONS SELECTION DICTIONARY */
var options = {
  'LULC': 'lulc_selection',
  'LULC Change': 'lulc_change_selection',
  'Night Lights Timelapse': 'Night Light GIF 2000-2020',
  'Swipe': 'Observe the changes with swipe feature'
}

/* END OF DEFINITIONS */


// ------------------------------------------------------------------------------------------------

// DEFINE ALL THE MAIN ELEMENTS AND THE FUNCTIONALITIES OF THE OF THE APP

// Generate main panel and add it to the root.
var panel = ui.Panel({style: {width:'30%', 'backgroundColor':'#002D62'}});
ui.root.insert(0,panel);

// Create a new main_map widget
var main_map = ui.Map({style: {width:'70%'}});
main_map.setCenter(77.6078, 28.3383, 10) // Set the center of the map and the zoom level
ui.root.insert(1,main_map); // add the main map widget to the root

// Add Title To The Panel
var title = ui.Label('Decadal Urban Growth of Gautam Buddha Nagar')
title.style().set({
  'color': '#ffffff', 
  'font-size': '35px',
  'padding': '20px 0 10px 20px',
  'backgroundColor':'#002D62',
  'text-align': 'left',
  'font-weight': 'bold'
});
panel.add(title)

// Add Some Basic Information About The Dashboard
var dashboard_info = ui.Label('This dashboard shows the decadal urban growth from 1992 to 2022 of Gautam Buddha Nagar district in Uttar Pradesh.'+
                              ' The user can select any four options, LULC, LULC Change, Nightlights Timelapse, and Swipe.')
dashboard_info.style().set({
  'color': '#000000', 
  'font-size': '22px',
  'padding': '17px',
  'text-align': 'justify',
  'backgroundColor': '#FFF0F0',
  'font-family': 'Helvetica',
});
panel.add(dashboard_info)


// LULC LABEL - This Label appears when the LULC option is selected
var lulc_label = ui.Label('LULC shows the Land use Land cover statistics for 1992, 2002, 2013, and 2022.'+
                            ' Choose a map below.');
lulc_label.style().set({
  'color': '#ffffff', 
  'font-size': '23px',
  'padding': '17px',
  'text-align': 'justify',
  'backgroundColor': '#002D62',
  'font-family': 'Helvetica',
});


// LULC CHANGE LABEL - This Label appears when the LULC Change option is selected
var lulc_change_label = ui.Label('LULC Change indicates the changes between 1992-2002, 2002-2013, and 2013-2022.'+
                            ' Choose a map below.');
lulc_change_label.style().set({
  'color': '#ffffff', 
  'font-size': '23px',
  'padding': '17px',
  'text-align': 'justify',
  'backgroundColor': '#002D62',
  'font-family': 'Helvetica',
});

// NIGHTLIGHT TIMELAPSE LABEL - This Label appears when the NIGHTLIGHT TIMELAPSE option is selected
var nightlight_timelapse_label = ui.Label('Nightlights timelapse shows the timelapse of the nightlight images from 2000-2020.'+
                            ' Click on the link below.');
nightlight_timelapse_label.style().set({
  'color': '#ffffff', 
  'font-size': '23px',
  'padding': '17px',
  'text-align': 'justify',
  'backgroundColor': '#002D62',
  'font-family': 'Helvetica',
});

// SWIPE LABEL - This Label appears when the SWIPE option is selected
var swipe_label = ui.Label('The Swipe feature is used to compare the urban growth between any two years.');
swipe_label.style().set({
  'color': '#ffffff', 
  'font-size': '23px',
  'padding': '17px',
  'text-align': 'justify',
  'backgroundColor': '#002D62',
  'font-family': '"Helvetica',
});

// Nightlights youtube link label
var nightlight_link = ui.Label('Click on this link');
nightlight_link.style().set({
  'color':'#ffffff',
  'padding': '17px',
  'backgroundColor': '#e7e7e7',
});
nightlight_link.setUrl('https://youtu.be/yxYkYE9-rWo'); // This opens up youtube link to view the nightlights GIF

// Define Chart element
var chart_1992 = ui.Chart.array.values(areas_1992, 0, class_names).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Classes'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area by class 1992',
                    legend: { position: "none" }
                  });

var chart_2002 = ui.Chart.array.values(areas_2002, 0, class_names).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Classes'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area by class in 2002',
                    legend: { position: "none" }
                  });
                  
var chart_2013 = ui.Chart.array.values(areas_2013, 0, class_names).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Classes'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area by class in 2013',
                    legend: { position: "none" }
                  });
                  
var chart_2022 = ui.Chart.array.values(areas_2022, 0, class_names).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Classes'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area by class in 2022',
                    legend: { position: "none" }
                  });
                  
var chart_1992_2002 = ui.Chart.array.values(area_change_1992_2002, 0, area_change_classes).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Class-Urban'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area change from each class to Urban from 1992-2002',
                    legend: { position: "none" }
                  });
                  
var chart_2002_2013 = ui.Chart.array.values(area_change_2002_2013, 0, area_change_classes).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Class-Urban'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area change from each class to Urban from 2002-2013',
                    legend: { position: "none" }
                  });
                  
var chart_2013_2022 = ui.Chart.array.values(area_change_2013_2022, 0, area_change_classes).setChartType('ColumnChart')
                    .setOptions({
                    hAxis: {title: 'Class-Urban'},
                    vAxis: {title: 'Area Km2'},
                    title: 'Area change from each class to Urban from 2013-2022',
                    legend: { position: "none" }
                  });

//--------------------------------------------------------------------------------------------------


/* Functionalities for the LULC Selection Widget */

var lulc_selection = ui.Select({
  items: Object.keys(lulc),
  onChange: function(key){
    if(key === 'LULC 1992'){
      main_map.clear();
      panel.remove(chart_2002);
      panel.remove(chart_2013);
      panel.remove(chart_2022);
      main_map.addLayer(lulc['LULC 1992'].clip(boundary), imageVisParam, 'LULC 1992');
      main_map.add(legend_panel);
      panel.add(chart_1992);
    }
    
    if(key === 'LULC 2002'){
      main_map.clear();
      panel.remove(chart_1992);
      panel.remove(chart_2013);
      panel.remove(chart_2022);
      main_map.addLayer(lulc['LULC 2002'].clip(boundary), imageVisParam, 'LULC 2002');
      main_map.add(legend_panel);

      panel.add(chart_2002);
    }
    
    if(key === 'LULC 2013'){
      main_map.clear();
      panel.remove(chart_1992);
      panel.remove(chart_2002);
      panel.remove(chart_2022);
      main_map.addLayer(lulc['LULC 2013'].clip(boundary), imageVisParam, 'LULC 2013');
      main_map.add(legend_panel);

      panel.add(chart_2013);
    }
    
    if(key === 'LULC 2022'){
      main_map.clear();
      panel.remove(chart_1992);
      panel.remove(chart_2002);
      panel.remove(chart_2013)
      main_map.addLayer(lulc['LULC 2022'].clip(boundary), imageVisParam, 'LULC 2022');
      main_map.add(legend_panel);

      panel.add(chart_2022);
    }
  }
  
});
lulc_selection.setPlaceholder('Select the LULC image');
lulc_selection.style().set({
  color: 'black',
  padding: '0 20px 0 20px',
  'backgroundColor':'#002D62'
});


/* Functionalities for the LULC Change Selection Widget */

var lulc_change_selection = ui.Select({
  items: Object.keys(lulc_change),
  onChange: function(key){
    if(key === 'LULC 1992-2002'){
      main_map.clear();
      legend_change_panel.remove(thumb_2013_2022)
      legend_change_panel.remove(thumb_2002_2013)
      panel.remove(chart_2002_2013)
      panel.remove(chart_2013_2022)
      main_map.addLayer(lulc_change['LULC 1992-2002'].clip(boundary), imageVisParam_change, 'LULC 1992-2002');
      
      // create legend for the LULC Change images
      legend_change_panel.add(thumb_1992_2002)
      main_map.add(legend_change_panel)
      

      panel.add(chart_1992_2002);
    }
    
    if(key === 'LULC 2002-2013'){
      main_map.clear();
      legend_change_panel.remove(thumb_1992_2002)
      legend_change_panel.remove(thumb_2013_2022)
      panel.remove(chart_1992_2002)
      panel.remove(chart_2013_2022)
      main_map.addLayer(lulc_change['LULC 2002-2013'].clip(boundary), imageVisParam_change, 'LULC 2002-2013');
      
      // create legend for the LULC Change images
      legend_change_panel.add(thumb_2002_2013)
      main_map.add(legend_change_panel)
      

      panel.add(chart_2002_2013);
    }
    
    if(key === 'LULC 2013-2022'){
      main_map.clear();
      legend_change_panel.remove(thumb_1992_2002)
      legend_change_panel.remove(thumb_2002_2013)
      panel.remove(chart_1992_2002)
      panel.remove(chart_2002_2013)
      main_map.addLayer(lulc_change['LULC 2013-2022'].clip(boundary), imageVisParam_change, 'LULC 2013-2022');
      
      // create legend for the LULC Change images
      legend_change_panel.add(thumb_2013_2022);
      main_map.add(legend_change_panel);
      

      panel.add(chart_2013_2022);
    }
  }
});
lulc_change_selection.setPlaceholder('Select the LULC Change Image');
lulc_change_selection.style().set({
  color: 'black',
  padding: '0 20px 0 20px',
  'backgroundColor':'#002D62'
});


// DEFINE FUNCTIONALITIES FOR OPTIONS SELECTIONS DROPDOWN

var options_selection = ui.Select({
  items: Object.keys(options), 
  onChange: function(key){
    if(key === 'LULC'){
      main_map.clear();
      panel.remove(chart_1992)
      panel.remove(chart_2002)
      panel.remove(chart_2013)
      panel.remove(chart_2022)
      panel.remove(chart_1992_2002)
      panel.remove(chart_2002_2013)
      panel.remove(chart_2013_2022);
      panel.remove(lulc_change_label);
      panel.remove(nightlight_timelapse_label);
      panel.remove(nightlight_link);
      panel.remove(swipe_label);
      panel.add(lulc_label);
      panel.remove(lulc_change_selection);
      ui.root.widgets().reset([panel, main_map]);
      panel.add(lulc_selection);
    }
    else if(key === 'LULC Change'){
      main_map.clear();
      panel.remove(chart_1992)
      panel.remove(chart_2002)
      panel.remove(chart_2013)
      panel.remove(chart_2022)
      panel.remove(chart_1992_2002)
      panel.remove(chart_2002_2013)
      panel.remove(chart_2013_2022);
      panel.remove(lulc_label);
      panel.remove(nightlight_timelapse_label);
      panel.remove(nightlight_link);
      panel.remove(swipe_label);
      panel.add(lulc_change_label);
      panel.remove(lulc_selection);
      ui.root.widgets().reset([panel, main_map]);
      panel.add(lulc_change_selection);
    }
    else if (key === 'Night Lights Timelapse'){
      main_map.clear();
      panel.remove(chart_1992)
      panel.remove(chart_2002)
      panel.remove(chart_2013)
      panel.remove(chart_2022)
      panel.remove(chart_1992_2002)
      panel.remove(chart_2002_2013)
      panel.remove(chart_2013_2022);
      panel.remove(lulc_label);
      panel.remove(lulc_change_label);
      panel.remove(swipe_label);
      panel.add(nightlight_timelapse_label);
      panel.add(nightlight_link)
      panel.remove(lulc_selection);
      ui.root.widgets().reset([panel, main_map]);
      panel.remove(lulc_change_selection);
    }
    else if (key === 'Swipe'){
      main_map.clear();
      panel.remove(chart_1992)
      panel.remove(chart_2002)
      panel.remove(chart_2013)
      panel.remove(chart_2022)
      panel.remove(chart_1992_2002)
      panel.remove(chart_2002_2013)
      panel.remove(chart_2013_2022);
      panel.remove(lulc_label);
      panel.remove(lulc_change_label);
      panel.remove(nightlight_timelapse_label);
      panel.remove(nightlight_link);
      panel.add(swipe_label);
      panel.remove(lulc_selection);
      panel.remove(lulc_change_selection);
      
      // Set the SplitPanel as the only thing in the UI root.
      ui.root.widgets().reset([panel, splitPanel]);
      var linker = ui.Map.Linker([leftMap, rightMap]);
      leftMap.setCenter(77.3910, 28.5355, 12);
    }
  }
});
options_selection.setPlaceholder('Choose a map');
options_selection.style().set({
  color: 'black',
  padding: '0 20px 0 20px',
  'backgroundColor':'#002D62'
});

panel.add(options_selection);


// Add Split Panel Feature For Swiping Between Images

// Create the left map, and have it display layer 0.
var leftMap = ui.Map();
leftMap.setControlVisibility(false);
var leftSelector = addLayerSelector(leftMap, 0, 'top-left');

// Create the right map, and have it display layer 1.
var rightMap = ui.Map();
rightMap.setControlVisibility(false);
var rightSelector = addLayerSelector(rightMap, 1, 'top-right');

// Adds a layer selection widget to the given map, to allow users to change
// which image is displayed in the associated map.
function addLayerSelector(mapToChange, defaultValue, position) {
  var label = ui.Label('Choose an image to visualize');

  // This function changes the given map to show the selected image.
  function updateMap(selection) {
    mapToChange.layers().set(0, ui.Map.Layer(lulc[selection].clip(boundary), imageVisParam));
  }

  // Configure a selection dropdown to allow the user to choose between images,
  // and set the map to update when a user makes a selection.
  var select = ui.Select({items: Object.keys(lulc), onChange: updateMap});
  select.setValue(Object.keys(lulc)[defaultValue], true);

  var controlPanel =
      ui.Panel({widgets: [label, select], style: {position: position}});

  mapToChange.add(controlPanel);
}

/*
 * Tie everything together
 */

// Create a SplitPanel to hold the adjacent, linked maps.
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  wipe: true,
  style: {stretch: 'both'}
});