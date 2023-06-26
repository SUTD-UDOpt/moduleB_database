// Input Components
document.getElementById("clearFilter").addEventListener("click", () => {
  clearEverything()
  state = 0
  savedPolygon = undefined
  savedPolygonGraphic = undefined
  document.getElementById("actionButton").innerHTML = "Process Polygon"
});

// Result Components
document.getElementById("cancelResetButton").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none"
  document.getElementById("resetPrompt").style.display = "none"
})

document.getElementById("finalResetButton").addEventListener("click", () => {
  if (document.querySelector('#reset1').checked){
    toState0()
    resetSceneAndData()
  } else {
    toState0()
    clearEverything()
    savedPolygon = undefined
  }
  document.getElementById("popup").style.display = "none"
  document.getElementById("resetPrompt").style.display = "none"
  popup = false
})

// UI State Management Functions
function toState0() {
    state = 0
    setComponentDisplay([0, 1, 1])
    document.getElementById("actionButton").innerHTML = "Generate Building Geometry"
    document.getElementById("saveAction").style.display = "none"
}

function toState1() {
  state = 1
  setComponentDisplay([1, 2, 2])
  document.getElementById("actionButton").innerHTML = "Reset"
  document.getElementById("resultB").style.display = "block"
  removeAllChildNodes(document.getElementById("resultB"))
  genBuildingLayer.removeAll()
  genSetbackLayer.removeAll()
}

function setComponentDisplay(arr){
  let components = [
  document.getElementById("resultDiv"), 
  document.getElementById("clearFilter"),
  document.getElementById("polygon-geometry-button")]

  for (let i=0; i<3; i++){
    if (arr[i] == 0){
      components[i].style.display = "none"
    } else if (arr[i] == 1){
      components[i].style.display = "block"
    }
  }
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}