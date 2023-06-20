require(["esri/Map", "esri/views/SceneView", "esri/layers/GraphicsLayer","esri/widgets/Sketch/SketchViewModel","esri/layers/support/FeatureFilter","esri/geometry/geometryEngine", "esri/Graphic","esri/layers/FeatureLayer","esri/geometry/SpatialReference","esri/views/3d/externalRenderers","esri/widgets/Measurement","esri/Ground", "esri/geometry/Polygon"], 
(Map, SceneView, GraphicsLayer, SketchViewModel, FeatureFilter, geometryEngine, Graphic, FeatureLayer, SpatialReference, externalRenderers, Measurement, Ground, Polygon) => {
  setupLayers(FeatureLayer, GraphicsLayer)
  setupMap(Map, SceneView, Ground)
  setupWidgets(Measurement)
  setupSketch(SketchViewModel, FeatureFilter, Graphic, geometryEngine)

  document.getElementById("actionButton").addEventListener("click", () => {
    if (state == 0){
      if (currentPolygon != undefined){
        document.getElementById("popup").style.display = "block"
        document.getElementById("optimizePrompt").style.display = "block"
        popup = true
        savedPolygon = currentPolygon
        resiParcels.push(savedPolygon)
      } else {
        alert("Please draw a polygon first")
      }
    } else if(state == 1) {
      document.getElementById("popup").style.display = "block"
      document.getElementById("resetPrompt").style.display = "block"
      popup = true
    }
  })

  document.getElementById("optButton").addEventListener("click", () => {
    setComponentDisplay([1,2,0])
    document.getElementById('loader').style.display = 'block';
    document.getElementById('resultB').style.display = 'block';
    document.getElementById("actionButton").disabled = true
    document.getElementById("clearFilter").style.display = "none"
    document.getElementById("popup").style.display = "none"
    document.getElementById("optimizePrompt").style.display = "none"
    popup = false
    useRoadData(Graphic, Polygon)
  })
});