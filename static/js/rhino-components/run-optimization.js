async function useRoadData(Graphic, Polygon){
    let input = []
    let vertices = savedPolygon.rings.toString().split(",")
    for (let i=0; i<vertices.length/2; i++){
      input.push([parseFloat(vertices[i*2]), parseFloat(vertices[i*2+1])])
    }
  
    const options = {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify(input)
    };
  
    fetch('/api_roadCat', options)
    .then(function (response) {
      return response.json();
    })
    .then(function(text){
      let roadCat = JSON.parse(text).toString().split(",")
      runOptimization(Graphic, Polygon, roadCat)
    })
    // runOptimization(Graphic, Polygon,[5,5,5,5])
}

async function runOptimization(Graphic, Polygon, roadCat) {
    let ringCoords = savedPolygon.rings[0]
    for (let i=0; i<ringCoords.length; i++){
        ringCoords[i].push(0.2)
    }

    let input = {}
    resiParcels.forEach(e => {
        input[e] = {
            "BKeySelection": [
                2,
                4,
                5,
                6,
                7,
                8,
                10,
                12,
                14
            ],
            "EdgeCategory": roadCat,
            "GPR": "None",
            "OptimisationParameters": {
                "CrossOverRate": document.getElementById("param6").value,
                "GenerationCount": document.getElementById("param7").value,
                "MutationRate": document.getElementById("param8").value,
                "ObjectiveWeights": null,
                "PopulationCount": document.getElementById("param9").value
            },
            "ParameterRanges": {
                "BKeyXScale": document.getElementById("param1").value.split(","),
                "BKeyYScale": document.getElementById("param2").value.split(","),
                "GridAngle": document.getElementById("param3").value.split(","),
                "GridSpacing": document.getElementById("param4").value.split(","),
                "ParcelStoreyScale": document.getElementById("param5").value.split(",")
            },
            "ParcelCoordinates": ringCoords
        }

        let GPRlist = document.getElementById("param10").value.split(",")
        let keys = Object.keys(input)
        for (let i=0; i< keys.length; i++){
            if (i < GPRlist.length){
                input[keys[i]]["GPR"] = GPRlist[i]
            } else {
                input[keys[i]]["GPR"] = GPRlist[i % GPRlist.length]
            }
        }
    })
    console.log(input)

    var fetchProgress = function(){
        try {
            fetch('api_getProgress')
            .then(function (response) {
                    return response.json();
                })
                .then(function(text) {
                console.log(text.data)
                if (text.data != 0){
                newRes = text.data
                if (state != 1){
                    toState1()
                }
                buildingData = newRes
                saveData[0]["buildingdata"] = buildingData
                processBuildingData(Graphic, Polygon)
                } else {
                newRes = undefined
                }
            })
            .then(function(){
                if (optFin == false && errorlog == false){
                    setTimeout(fetchProgress, 2000)
                } else if (errorlog == true){
                    alert("Sorry building generation was not successful, please revise your inputs.")
                    document.getElementById("actionButton").disabled = false;
                    document.getElementById('loader').style.display = 'none'
                    console.log("There's an error..")
                } else {
                    console.log("Opt fin")
                    optFin = false
                    errorlog = false
                }
            })
        } catch (error){
            alert("Sorry building generation was not successful, please revise your inputs.")
            document.getElementById("actionButton").disabled = false;
            document.getElementById('loader').style.display = 'none'
            console.log(error);
        }
    }

    const options = {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify(input)
    };

    fetch('/api_python', options)
    .then(function (response) {
        console.log(response)
        optFin = true
        return response.json();
    })
    .then(function(text){
        console.log(text.data)
        if (text.data != 1){
            if (state != 1){
                toState1()
            }
            buildingData = text.data
            saveData[0]["buildingdata"] = buildingData
            processBuildingData(Graphic, Polygon)
        }
        document.getElementById("actionButton").disabled = false
        document.getElementById('loader').style.display = 'none';
    })
    .then(function(){
        if (buildingData == undefined){
            toState1()
            alert("No valid results generated, you might want to try adjusting your inputs")
        }
    })

    fetchProgress()
}