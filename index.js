document.addEventListener('DOMContentLoaded', function () {
  // Check if user has saved password
  if (localStorage.getItem('password') == null) {
    showLoginPage();
  } else {
    showPage('buttonsPage');
  }

  // Add event listener to login form
  var loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = document.getElementById('password').value;
    localStorage.setItem('password', password);
    //
    showPage('buttonsPage');
  });

  // Add event listeners to navigation buttons
  var buttons = document.querySelectorAll('#navigation button');
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var pageId = this.getAttribute('data-page');
      showPage(pageId);
    });
  });

  // Initialize the iro.js color picker with color wheel and darkness slider
  var colorPicker = new iro.ColorPicker('#colorControls', {
    width: 300,
    borderWidth: 1,
    borderColor: '#fff',
    layout: [{
        component: iro.ui.Wheel
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'value'
        }
      }
    ],
    color: "#ff0000" // Default color
  });

  // Event listener for color changes
  var debouncedSetLights = debounce(setLights, 300); // Adjust delay as needed

  colorPicker.on('color:change', function (color) {
    // Update the input field with the selected color in HEX format
    document.getElementById('colorPicker').value = color.hexString;
    // Make an API call to set the lights
    debouncedSetLights(color.rgb.r, color.rgb.g, color.rgb.b);
  });

  function setLights(r, g, b) {
    // Update the apiUrl with the new API endpoint and IP address
    var apiUrl = `https://bennettolsen.us:5000/set_lights?password=${localStorage.getItem('password')}&r=${r}&g=${g}&b=${b}`;

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
        alert(`Error executing Set Lights script: ${error.message}`);
      });
  }

  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, delay);
    };
  }

  // Event listener for darkness slider changes
  colorPicker.on('input:change', function (color) {
    // Check if color object is defined
    if (color && color._color && typeof color._color.v !== 'undefined') {
      // Synchronize the darkness slider with the color wheel
      var brightness = 1 - color._color.v; // Invert the darkness value
      colorPicker.color.set({
        v: brightness
      }); // Set the brightness value
    }
  });
});

function showPage(pageId) {
  console.log("showing page:" + pageId);
  document.getElementById('navigation').style.display = 'block';
  var pages = document.querySelectorAll('[id$="Page"]');
  pages.forEach(function (page) {
    page.style.display = 'none';
  });

  // Update selected page
  var selectedPage = document.getElementById(pageId);
  selectedPage.style.display = 'block';

  // Update the selected class for navigation buttons
  var buttons = document.querySelectorAll('#navigation button');
  buttons.forEach(function (button) {
    button.classList.remove('selected');
    if (button.getAttribute('data-page') === pageId) {
      button.classList.add('selected');
    }
  });
}

function runScript(scriptName) {
  // Update the apiUrl with the new API endpoint and IP address
  var apiUrl = `https://bennettolsen.us:5000/${scriptName}?password=${localStorage.getItem('password')}`;

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
}

function showLoginPage() {
  // Show the login page and hide other content
  document.getElementById('navigation').style.display = 'none';
  var pages = document.querySelectorAll('[id$="Page"]');
  pages.forEach(function (page) {
    page.style.display = 'none';
  });

  var loginPage = document.getElementById('loginPage');
  loginPage.style.display = 'block';
}