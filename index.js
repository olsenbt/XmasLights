// script.js
window.addEventListener('load', function() {
   // Set a timeout to ensure the page is fully loaded
   setTimeout(function() {
     // Hide the address bar
     window.scrollTo(0, 1);
    }, 0);
});



function runScript(scriptName) {
    // Replace this URL with the actual URL of your Raspberry Pi
    var apiUrl = `https://bennettolsen.us:5000/${scriptName}`;

    // Send a GET request to the API endpoint
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
            console.log(result);
            alert(`${scriptName} script executed successfully!`);
        })
        .catch(error => {
            console.error(error);
            alert(`Error executing ${scriptName} script: ${error.message}`);
        });

    // Toggle the "selected" class
    toggleSelected(scriptName);
}

function toggleSelected(scriptName) {
    // Get all buttons
    var buttons = document.getElementsByTagName('button');

    // Remove the "selected" class from all buttons
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('selected');
    }

    // Add the "selected" class to the clicked button
    var clickedButton = document.getElementById(`${scriptName}Button`);
    clickedButton.classList.add('selected');
}
