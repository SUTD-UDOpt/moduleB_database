//setting up editor and passing data
window.onload = function() {
    console.log("Setting up the editor...");  // This should show in the console when the page loads
    const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        mode: "application/json"
    });

    // session_id placeholder
    var sessionId = '';

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
    } else {
        console.log("No data found in localStorage");
    }
};


//behavior after clicking the submit button