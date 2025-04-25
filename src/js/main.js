import { setupEventListeners } from './eventHandlers.js';
import { calculateAndPlot } from './calculator.js';
import { Constants } from './constants.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Binary Star RV Calculator initialized');
  
  // Setup all event listeners
  setupEventListeners();
  
  // Trigger initial calculation with default values
  calculateAndPlot(new Event('submit'));
  
  // Add resize listener for Plotly
  window.addEventListener('resize', () => {
    const plotDiv = document.getElementById('rvPlot');
    if (plotDiv && plotDiv.offsetParent !== null) { // Check if plot div is visible
      Plotly.Plots.resize(plotDiv);
    }
  });
});