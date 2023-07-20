// session_id placeholder
var editor;
var sessionId = '';
var newSessionId = '';
var timestamp = '';
var newTimestamp = '';
var prevName = '';
var newName = '';

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
        if (myData[0]["Session_ID"] && myData[0]["Timestamp"]){
            sessionId = myData[0]["Session_ID"];
            timestamp = myData[0]["Timestamp"];
            prevName  = myData[0]["Name"];
        }
        console.log("Session ID in editor.js -->  ", sessionId);
        console.log("Timestamp in editor.js -->  ", timestamp);
        //displaying sessionId and prev name and new sessionId on editor.html
        document.getElementById('currentSessionId').innerText = "Current Session ID: " + sessionId;
        document.getElementById('prevName').innerText = "Current data name: " + prevName;
        document.getElementById('newSessionId').innerText = "New Session ID: " + newSessionId;


        //get new data name from user
        document.getElementById('nameForm').addEventListener('submit', function(event){
            // Prevents the default form submission action
            event.preventDefault();

            newName = document.getElementById('newName').value;
            console.log(newName);
        })

        // create copy of the data w/o sid and timestamp
        var myDataCopy = myData.map(function(obj){
            var objCopy = {...obj}; //create a copy of the obj
            delete objCopy["Session_ID"];
            delete objCopy["Timestamp"];
            delete objCopy["Name"];
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
                //get new session_id and timestamp
                newSessionId = uuidv4();
                newTimestamp = moment().tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ssZ');

                //display new session_id
                document.getElementById('newSessionId').innerText = "New Session ID: " + newSessionId + " for " + newName;

                //add sessionId back
                var updatedData = currentData.map(function(obj){
                    var newObj = {"Session_ID": newSessionId, "Timestamp": newTimestamp, "Name": newName, ...obj}; //create a copy
                    return newObj;
                });
                // convert the updated data back to a string
                var updatedDataAsString = JSON.stringify(updatedData, null, 2);
                console.log(updatedDataAsString);
                alert(`New SessionID is: ${newSessionId}\n you should record this down!`);
            }catch(e){
                console.error("The edited data is not in valid JSON, check the formatting: ", e);
            }
            try{
                //do a POST query to the database 
                if (updatedDataAsString){
                    // console.log(updatedDataAsString);
                    //send data to API
                    fetch('/submit-edited-data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: updatedDataAsString,
                    }).then (response => {
                        if (!response.ok){
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    }).then(data => {
                        console.log('Successfully sent edited data to api:', data);
                    })
                }
            }catch(e){
                console.error("Unable to send to API, from editor.js")
            }
        })
    } else {
        console.log("No data found in localStorage");
    }
};
