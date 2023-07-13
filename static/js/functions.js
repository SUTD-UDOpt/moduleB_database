
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

//load session id
document.getElementById('loadAction').addEventListener('click', function() {
  var sessionId = document.getElementById('loadSession').value;
  
  console.log("Sent sessionId: ", sessionId); // For debugging: print it to the console.
  fetch('/get-data',{
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({ sessionId: sessionId }),
  })
  .then(response => response.blob())
  .then(blob => {
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url
    a.download = `${sessionId}.json`;
    document.body.appendChild(a);
    a.click(); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.remove(); //afterwards we remove the element again    
  });
});

//save session id
document.getElementById('saveAction').addEventListener('click', function(){
  console.log("Save Session ID button is clicked!")
  fetch('/get-session-id')
    .then(response => response.json())
    .then(data => {
      if (data.sessionId !== ''){
        alert(`Session ID: ${data.sessionId}`);
      }else {
        alert('Session ID is not available, run an optimisation and try again');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

//for user to modify data
document.getElementById('modifyAction').addEventListener('click', function(){
  console.log("Modify button has been clicked!!")
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
