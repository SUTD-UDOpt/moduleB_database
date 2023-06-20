function processBuildingData(Graphic, Polygon){
  removeAllChildNodes(document.getElementById("resultB"))
  let buttonContainer = document.getElementById("resultB");
  Object.keys(buildingData["Archive"]).forEach(e => {
    let data = JSON.parse(buildingData["Archive"][e])
    console.log(data)
    let singleRow = document.createElement("div");
    singleRow.setAttribute("class", "row");
    singleRow.setAttribute("id", "row" + e);
    let button = document.createElement("button");
    button.classList.add("esri-button")
    button.classList.add("limited")
    button.classList.add("bottomMargin")
    button.innerHTML = "RESULT " + e
    singleRow.appendChild(button)
    button.addEventListener("click", () => {
      // let radioButtons = document.querySelectorAll('input[name="viewBOpt"]');
      // let optResView
      // radioButtons.forEach(e => {
      //   if (e.checked){
      //     optResView = e.value
      //   }
      // })
      genBuildingLayer.removeAll()
      genSetbackLayer.removeAll()

      if (data != null){
        console.log(data)
        Object.keys(data["buildingGenerationOutput"]).forEach(e => {
          let dataContent = data["buildingGenerationOutput"][e]

          if (dataContent["SetbackCurve"].length > 0){
            renderSetback(Graphic, Polygon, dataContent["SetbackCurve"][0])
            renderBuildings(Graphic, Polygon, dataContent["BuildingFootprint"], dataContent["BuildingStoreys"])
          }
        })
      }
      // if (optResView == "normal"){
      //   renderBuildings(buildingData["Model"][e]["MeanEWAspectRatio"]["meshstring"], ["#f1f1f1"])
      // } else if (optResView == "orientation"){
      //   renderBuildings(buildingData["Model"][e]["MeanEWAspectRatio"]["meshstring"], buildingData["Model"][e]["MeanEWAspectRatio"]["color"])
      // } else if (optResView == "views"){
      //   renderBuildings(buildingData["Model"][e]["TotalViewObstruction"]["meshstring"], buildingData["Model"][e]["TotalViewObstruction"]["color"])
      // }

      if (currsel != undefined){
        currsel.classList.remove("selected")
      }
      button.classList.add("selected");
      currsel = button
    })
    buttonContainer.appendChild(singleRow);
  })
}