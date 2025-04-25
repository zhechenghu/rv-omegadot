/**
 * Event handlers and listeners for the Binary Star RV Calculator
 */
import { calculateAndPlot } from './calculator.js';

/**
 * Sets up all event listeners for the application
 */
export function setupEventListeners() {
  const form = document.getElementById('rvForm');
  const kMethodSelect = document.getElementById('kMethod');
  const showNoApsidalCheckbox = document.getElementById('showNoApsidal');
  
  // Form submission
  form.addEventListener('submit', calculateAndPlot);
  
  // K calculation method selection
  kMethodSelect.addEventListener('change', toggleInputVisibility);
  
  // Show/hide without apsidal motion curve
  showNoApsidalCheckbox.addEventListener('change', (event) => {
    // Recalculate immediately when toggling the comparison curve
    calculateAndPlot(new Event('submit'));
  });
  
  // Input field animation effects
  const inputFields = form.querySelectorAll('input, select');
  inputFields.forEach(field => {
    field.addEventListener('focus', () => {
      field.classList.add('ring-2', 'ring-primary-200', 'ring-opacity-50');
    });
    
    field.addEventListener('blur', () => {
      field.classList.remove('ring-2', 'ring-primary-200', 'ring-opacity-50');
    });
  });
}

/**
 * Toggles visibility of input fields based on K calculation method
 */
function toggleInputVisibility() {
  const kMethodSelect = document.getElementById('kMethod');
  const directKInputDiv = document.getElementById('directKInput');
  const massInclinationInputDiv = document.getElementById('massInclinationInput');
  
  const selectedMethod = kMethodSelect.value;
  
  if (selectedMethod === 'direct') {
    directKInputDiv.classList.remove('hidden');
    massInclinationInputDiv.classList.add('hidden');
  } else if (selectedMethod === 'masses') {
    directKInputDiv.classList.add('hidden');
    massInclinationInputDiv.classList.remove('hidden');
  } else {
    directKInputDiv.classList.add('hidden');
    massInclinationInputDiv.classList.add('hidden');
  }
}