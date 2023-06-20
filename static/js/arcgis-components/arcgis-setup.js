const setbackSymbol = {
    type: "simple-fill",
    color: [255, 255, 255, 0],
    outline: {
        color: [0, 0, 0],
        width: 2
    }
};

function setupLayers(FeatureLayer, GraphicsLayer){
    // Renderer for feature layer to extrude feature (also possible to extrude by linked data)
    featureRenderer = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
            type: "polygon-3d", // autocasts as new PolygonSymbol3D()
            symbolLayers: [{
            type: "extrude",  // autocasts as new ExtrudeSymbol3DLayer()
            size: 50,  // 100,000 meters in height
            material: { color: "#a9c6db" }
            }]
        }
    };

    // Create the layer and set the renderer
    buildingLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/s71tOLTNP0DMzrOH/arcgis/rest/services/gis_osm_buildings_permanent/FeatureServer/0",
        opacity: 0.8,
        renderer: featureRenderer
    });

    // add a GraphicsLayer for the sketches and the buffer (this is for sketching)
    sketchLayer = new GraphicsLayer();
    bufferLayer = new GraphicsLayer();

    // add a GraphicsLayer for displaying parcellation results
    genBuildingLayer = new GraphicsLayer();
    genSetbackLayer = new GraphicsLayer();
}

function setupMap(Map, SceneView, Ground){
    //This is where the tile based map is configured
    map = new Map({
        basemap: "topo-vector",
        //ground: "world-elevation",
        ground: new Ground()
    });

    view = new SceneView({
        container: "viewDiv", // Reference to the scene div created in step 5
        map: map, // Reference to the map object created before the scene
        zoom: 17,
        center: [103.955, 1.35], // Sets the center point of view with lon/lat
        viewingMode: "local",
    });
    window.view = view;
    view.constraints.clipDistance.near = 100
    view.constraints.clipDistance.far = 175000

    view.map.addMany([buildingLayer, bufferLayer, sketchLayer, genBuildingLayer, genSetbackLayer]);

    // create the layerView's to add the filter
    featureLayerView = null;

    // loop through webmap's operational layers
    view.map.layers.forEach((layer, index) => {
    view.whenLayerView(layer)
        .then((layerView) => {
            if (layer.type === "feature") {
                featureLayerView = layerView;
            }
        })
        .catch(console.error);
    });
    view.watch('zoom', zoomChanged);
}

function setupWidgets(Measurement){
    // Create new instance of the Measurement widget
    measurement = new Measurement();

    // configure measurement buttons
    let activeView = view
    measurement.view = activeView;
    document.getElementById("distance").onclick = measureDistance;
    document.getElementById("area").onclick = measureArea;
    document.getElementById("clearMe").onclick = clearMeasure;
}

function setupSketch(SketchViewModel, FeatureFilter, Graphic, geometryEngine){
    // use SketchViewModel to draw polygons that are used as a filter
    sketchGeometry = null;
    sketchViewModel = new SketchViewModel({
        layer: sketchLayer,
        view: view,
        polygonSymbol: {
            type: "polygon-3d",
            symbolLayers: [
            {
                type: "fill",
                material: {
                color: [40, 60, 100, 0.9]
                },
                outline: {
                color: [211, 132, 80, 0.7],
                size: "2px"
                }
            }
            ]
        },
        defaultCreateOptions: { hasZ: false }
    });

    sketchViewModel.on(["create"], (event, geom) => {
        // update the filter every time the user finishes drawing the filtergeometry
        if (event.state == "complete") {
            sketchGeometry = event.graphic.geometry;
            if (sketchGeometry.type == "polygon" && state == 0){
                updateFilter(FeatureFilter, Graphic, geometryEngine);
                currentPolygon = sketchGeometry
                currentPolygonGraphic = event.graphic
            } else {
                currentPolygon = undefined
            }
        }
    });
  
    sketchViewModel.on(["update"], (event) => {
        eventInfo = event.toolEventInfo;
        // update the filter every time the user moves the filtergeometry
        if (event.toolEventInfo && event.toolEventInfo.type.includes("stop")) {
            sketchGeometry = event.graphics[0].geometry;
            updateFilter(FeatureFilter, Graphic, geometryEngine);
        }
    });
  
    // configure sketch buttons
    document.getElementById("polygon-geometry-button").onclick = geometryButtonsClickHandler;
}