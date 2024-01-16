document.addEventListener('DOMContentLoaded', function() {
  showPage('buttonsPage'); // Show the buttons page by default

  // Add event listeners to navigation buttons
  var buttons = document.querySelectorAll('#navigation button');
  buttons.forEach(function(button) {
      button.addEventListener('click', function() {
          var pageId = this.getAttribute('data-page');
          showPage(pageId);
      });
  });

  // Initialize the iro.js color picker with color wheel and darkness slider
  var colorPicker = new iro.ColorPicker('#colorControls', {
      width: 200,
      borderWidth: 1,
      borderColor: '#fff',
      layout: [
          { component: iro.ui.Wheel },
          { component: iro.ui.Slider, options: { sliderType: 'value' } }
      ],
      color: "#ff0000" // Default color
  });

  // Event listener for color changes
  colorPicker.on('color:change', function(color) {
      // Update the input field with the selected color in HEX format
      document.getElementById('colorPicker').value = color.hexString;
  });

  // Event listener for darkness slider changes
  colorPicker.on('input:change', function(color) {
      // Synchronize the darkness slider with the color wheel
      var brightness = 1 - color._color.v; // Invert the darkness value
      colorPicker.color.set({ v: brightness }); // Set the brightness value
  });
});

function showPage(pageId) {
  // Hide all pages
  var pages = document.querySelectorAll('[id$="Page"]'); // Select all elements with IDs ending with "Page"
  pages.forEach(function(page) {
      page.style.display = 'none';
  });

  // Show the selected page
  var selectedPage = document.getElementById(pageId);
  selectedPage.style.display = 'block';

  // Update the selected class for navigation buttons
  var buttons = document.querySelectorAll('#navigation button');
  buttons.forEach(function(button) {
      button.classList.remove('selected');
      if (button.getAttribute('data-page') === pageId) {
          button.classList.add('selected');
      }
  });
}
