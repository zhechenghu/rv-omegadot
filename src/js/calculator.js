/**
 * Main calculation and plotting logic
 */
import { Constants } from './constants.js';
import { validateInputs, showError, setLoading } from './utils.js';
import { calculateK, generateRVData } from './binaryDynamics.js';
import { createRVPlot } from './plotting.js';

/**
 * Handles form submission: gathers inputs, calculates, and plots
 * @param {Event} event - The form submission event
 */
export function calculateAndPlot(event) {
  event.preventDefault(); // Prevent default form submission
  
  // Reset UI state
  const errorMessageDiv = document.getElementById('errorMessage');
  errorMessageDiv.classList.add('hidden');
  errorMessageDiv.textContent = '';
  
  setLoading(true);
  
  try {
    // --- Gather Inputs ---
    const form = document.getElementById('rvForm');
    const formData = new FormData(form);
    const inputs = Object.fromEntries(formData.entries());
    
    // Convert to proper types
    const P_day = parseFloat(inputs.P_day);
    const e = parseFloat(inputs.e);
    const omega0_deg = parseFloat(inputs.omega0_deg);
    const omega_dot_arcsec_yr = parseFloat(inputs.omega_dot_arcsec_yr);
    const T_p_day = parseFloat(inputs.T_p_day);
    const V_gamma_kms = parseFloat(inputs.V_gamma_kms);
    const start_period = parseInt(inputs.start_period);
    const end_period = parseInt(inputs.end_period);
    const points_per_period = parseInt(inputs.points_per_period);
    const kMethod = inputs.kMethod;
    const showNoApsidal = document.getElementById('showNoApsidal').checked;
    
    // Convert arcsec/year to deg/year
    const omega_dot_deg_yr = omega_dot_arcsec_yr / 3600;
    
    // Validate inputs
    const validation = validateInputs({
      P_day, e, omega0_deg, omega_dot_deg_yr, T_p_day, V_gamma_kms,
      start_period, end_period, points_per_period, kMethod,
      K_kms: parseFloat(inputs.K_kms),
      m1_solar: parseFloat(inputs.m1_solar),
      m2_solar: parseFloat(inputs.m2_solar),
      i_deg: parseFloat(inputs.i_deg)
    });
    
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    // --- Calculate K ---
    let K_kms;
    if (kMethod === 'direct') {
      K_kms = parseFloat(inputs.K_kms);
    } else if (kMethod === 'masses') {
      const m1_solar = parseFloat(inputs.m1_solar);
      const m2_solar = parseFloat(inputs.m2_solar);
      const i_deg = parseFloat(inputs.i_deg);
      const i_rad = i_deg * Constants.DEG_TO_RAD;
      K_kms = calculateK(P_day, m1_solar, m2_solar, i_rad, e);
    } else {
      throw new Error("Invalid K calculation method selected.");
    }
    
    // --- Pre-calculate Derived Parameters ---
    const omega0_rad = omega0_deg * Constants.DEG_TO_RAD;
    const omega_dot_rad_yr = omega_dot_deg_yr * Constants.DEG_TO_RAD;
    const omega_dot_rad_day = omega_dot_rad_yr / Constants.YEAR_DAY;
    const n_rad_day = 2 * Math.PI / P_day;
    
    const params = { 
      K_kms, 
      P_day, 
      e, 
      omega0_rad, 
      omega_dot_rad_day, 
      T_p_day, 
      V_gamma_kms, 
      n_rad_day 
    };
    
    // --- Generate Data for Plotting ---
    const { t_values, rv_with_apsidal, rv_no_apsidal } = generateRVData(
      params, 
      start_period,
      end_period, 
      points_per_period, 
      showNoApsidal
    );
    
    // --- Create Plot ---
    const plotDiv = document.getElementById('rvPlot');
    createRVPlot(
      plotDiv, 
      t_values, 
      rv_with_apsidal, 
      showNoApsidal ? rv_no_apsidal : null, 
      params
    );
    
  } catch (error) {
    console.error("Calculation Error:", error);
    showError(error.message);
  } finally {
    setLoading(false); // Re-enable button
  }
}