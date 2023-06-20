function zoomChanged(newValue, oldValue, property, object){
    if (newValue < 12){
        view.zoom = 12
    }
}

// Call the appropriate DistanceMeasurement2D or DirectLineMeasurement3D
function measureDistance() {
    const type = activeView.type;
    measurement.activeTool =
        type.toUpperCase() === "2D" ? "distance" : "direct-line";
        document.getElementById("distance").classList.add("active");
        document.getElementById("area").classList.remove("active");
}

// Call the appropriate AreaMeasurement2D or AreaMeasurement3D
    function measureArea() {
    measurement.activeTool = "area";
    document.getElementById("distance").classList.remove("active");
    document.getElementById("area").classList.add("active");
}

// Clears all measurements
    function clearMeasure() {
    document.getElementById("distance").classList.remove("active");
    document.getElementById("area").classList.remove("active");
    measurement.clear();
}

function clearPolygon() {
    let sketches = sketchLayer.graphics.items
    let toRemove
    sketches.forEach(e => {
        if (e.geometry.type == "polygon"){
            toRemove = e
        }
    })
    sketchLayer.remove(toRemove)
}

function clearEverything() {
    sketchGeometry = null;
    filterGeometry = null;
    sketchLayer.removeAll();
    bufferLayer.removeAll();
    removeAllChildNodes(document.getElementById("resultB"))
    clearScene()
    if (featureLayerView != null){
        featureLayerView.filter = null;
    }
    currentPolygon = undefined
    currentPolygonGraphic = undefined
    document.getElementById("polygon-geometry-button").style.display = "block"
    resetSceneAndData()
}

function clearScene(){
    genBuildingLayer.removeAll()
    genSetbackLayer.removeAll()
}

function resetSceneAndData(){
    buildingData = undefined
    clearScene()
}

function geometryButtonsClickHandler(event) {
    const geometryType = event.target.value;
    clearPolygon()
    sketchViewModel.create(geometryType);
}

// set the geometry filter on the visible FeatureLayerView (specify which features to select based on sketched geometry)
function updateFilter(FeatureFilter, Graphic, geometryEngine) {
    updateFilterGeometry(Graphic, geometryEngine);
    featureFilter = new FeatureFilter({
      // autocasts to FeatureFilter
      geometry: filterGeometry,
      spatialRelationship: "disjoint"
    });

    featureLayerView.filter = featureFilter;
}

// update the filter geometry depending on bufferSize
function updateFilterGeometry(Graphic, geometryEngine) {
    // add a polygon graphic for the bufferSize
    if (sketchGeometry) {
        if (bufferSize > 0) {
            const bufferGeometry = geometryEngine.geodesicBuffer(
                sketchGeometry,
                bufferSize,
                "meters"
            );
            if (bufferLayer.graphics.length === 0) {
                bufferLayer.add(
                    new Graphic({
                        geometry: bufferGeometry,
                        symbol: sketchViewModel.polygonSymbol
                    })
                );
            } else {
                bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
            }
            filterGeometry = bufferGeometry;
        } else {
            bufferLayer.removeAll();
            filterGeometry = sketchGeometry;
        }
    }
}

function updateFilteronLoad(geom, Graphic, geometryEngine, FeatureFilter){
    if (bufferSize > 0) {
        const bufferGeometry = geometryEngine.geodesicBuffer(
            geom,
            bufferSize,
            "meters"
        );
        if (bufferLayer.graphics.length === 0) {
            bufferLayer.add(
                new Graphic({
                    geometry: bufferGeometry,
                    symbol: sketchViewModel.polygonSymbol
                })
            );
        } else {
            bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
        }
        filterGeometry = bufferGeometry;
    } else {
        bufferLayer.removeAll();
        filterGeometry = geom;
    }
    const featureFilter = new FeatureFilter({
        // autocasts to FeatureFilter
        geometry: filterGeometry,
        spatialRelationship: "disjoint"
    });

    featureLayerView.filter = featureFilter;
}

// Geometry Processes Function
function createPolygon(Graphic, Polygon, ring, symbol, num){
    let parcelPolygon = new Polygon({
        hasZ: true,
        hasM: true,
        rings: ring,
        spatialReference: { wkid: 3857 } // mercator
    })

    let graphic = new Graphic({
        geometry: parcelPolygon,
        symbol: symbol,
        key: num
    })

    return graphic
}

function createBuilding(Graphic, Polygon, ring, num, height){
    let basicBuildingSymbol = {
        type: "polygon-3d",  // autocasts as new PolygonSymbol3D()
        symbolLayers: [{
          type: "extrude",  // autocasts as new ExtrudeSymbol3DLayer()
          size: height * 3.5,  // 100,000 meters in height
          material: { color: "white" }
        }]
    };
    
    let geom = createPolygon(Graphic, Polygon, ring, basicBuildingSymbol, num)
    genBuildingLayer.add(geom)
}

function renderBuildings(Graphic, Polygon, listCoords, listHeight){
    for (let i=0; i<listCoords.length; i++){
        createBuilding(Graphic, Polygon, listCoords[i], i, listHeight[i])
    }
}

function renderSetback(Graphic, Polygon, listCoords){
    for (let i=0; i<listCoords.length; i++){
        listCoords[i][2] = 0.3
    }
    let setback = createPolygon(Graphic, Polygon, listCoords, setbackSymbol, "setback")
    genSetbackLayer.add(setback)
}