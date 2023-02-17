// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup describing the place and time of the earthquakes
    function onEachFeature(feature, layer){
      layer.bindPopup("<h3> Where: " + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<br><h2> Magnitude: " + feature.properties.mag + "</h2>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.35
       } 
       return L.circleMarker(latlng,options);
    }
    // Create a variable for earthquakes to house latlng, each feature for popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });
    d3.json(plateUrl).then(function (platedata) {
      var platefeatures = platedata.features
      var plates = L.geoJSON(platefeatures)

      // Send earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes,plates);
    });


    // Send earthquakes layer to the createMap function - will start creating the map and add features
    // createMap(earthquakes,plates);
}

// Circles color palette based on mag (feature) data marker: data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
function chooseColor(mag){
    switch(true){
        case(-10 <= mag && mag <= 10):
            return "#0071BC"; // Strong blue
        case (10 <= mag && mag <=30):
            return "#35BC00";
        case (30 <= mag && mag <=50):
            return "#BCBC00";
        case (50 <= mag && mag <= 70):
            return "#BC3500";
        case (70<= mag && mag <=90):
            return "#BC0000";
        default:
            return "#E2FFAE";

    }
}

// Create map legend to provide context for map data
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [-10, 30, 50, 70, 90];
    var labels = [];
    
// loop through density intervals
for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
return div;
};

function createMap(earthquakes, plates) {

// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap)

}

