// index.js
window.addEventListener('load', function() {
    // Set a timeout to ensure the page is fully loaded
    setTimeout(function() {
      // Hide the address bar
      window.scrollTo(0, 1);
    }, 0);
  });
  
  function runScript(scriptName) {
    // Update the apiUrl with the new API endpoint and IP address
    var apiUrl = `https://bennettolsen.us:5000/${scriptName}`;
  
    // Send a GET request to the updated API endpoint
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.text();
      })
      .then(result => {
        console.log(result);
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
  
  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/XmasLights/sw.js') // Updated path
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
  