// session_id placeholder
var sessionId = '';
var editor;
var newSessionId = '';

//setting up editor and passing data
window.onload = function() {
    console.log("Setting up the editor...");  // This should show in the console when the page loads
    const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        mode: "application/json"
    });

    // retrieve the data from browser localStorage
    var myData = JSON.parse(localStorage.getItem('myData'));
    if (myData) {
        if (myData[0]["Session_ID"]){
            var sessionId = myData[0]["Session_ID"];
        }
        console.log("Session ID in editor.js -->  ", sessionId);
        //displaying sessionId on editor.html
        document.getElementById('sessionId').innerText = "Current Session ID: " + sessionId;

        // create copy of the data w/o sid
        var myDataCopy = myData.map(function(obj){
            var objCopy = {...obj}; //create a copy of the obj
            delete objCopy["Session_ID"];
            return objCopy;
        });

        // convert the data to a formatted string
        var dataAsString = JSON.stringify(myDataCopy, null, 2);

        //set the editor's value
        editor.getDoc().setValue(dataAsString);

        //behavior after clicking the submit button
        document.getElementById('submit-button').addEventListener('click',function(){
            console.log("Submit button is clicked on editor")

            // get the edited data
            var currentEditorValue = editor.getValue();
            try{
                // parse it as JSON
                var currentData = JSON.parse(currentEditorValue);
                //add sessionId back
                var updatedData = currentData.map(function(obj){
                    var newObj = {"Session_ID": uuidv4(), ...obj}; //create a copy
                    return newObj;
                });
                // convert the updated data back to a string
                var updatedDataAsString = JSON.stringify(updatedData, null, 2);
                console.log(updatedDataAsString);

                //TODO: do a POST query to the database  
            }catch(e){
                console.error("The edited data is not in valid JSON, check the formatting: ", e);
            }
        })
    } else {
        console.log("No data found in localStorage");
    }
};
