/**
 * Utilities and helper functions for the Binary Star RV Calculator
 */
import { Constants } from './constants.js';

/**
 * Solves Kepler's equation M = E - e*sin(E) for the eccentric anomaly E using Newton-Raphson.
 * @param {number} M_rad - Mean anomaly in radians.
 * @param {number} e - Eccentricity.
 * @param {number} [tol=1e-8] - Tolerance for convergence.
 * @param {number} [max_iter=100] - Maximum number of iterations.
 * @returns {number} Eccentric anomaly E in radians.
 * @throws {Error} If the solver does not converge.
 */
export function solveKepler(M_rad, e, tol = 1e-8, max_iter = 100) {
  // Ensure M_rad is positive before starting
  while (M_rad < 0) M_rad += 2 * Math.PI;
  M_rad = M_rad % (2 * Math.PI);

  let E_rad = M_rad; // Initial guess: M for e=0
  // Better initial guess for higher eccentricities (Danby 1988)
  if (e > 0.8) {
    E_rad = Math.PI;
  }

  for (let i = 0; i < max_iter; i++) {
    const sinE = Math.sin(E_rad);
    const cosE = Math.cos(E_rad);
    const f_E = E_rad - e * sinE - M_rad;
    const fp_E = 1 - e * cosE;
    const delta_E = f_E / fp_E;

    // Check for convergence before applying correction
    if (Math.abs(f_E) < tol) { // Check function value closeness to zero
      return E_rad;
    }

    E_rad -= delta_E; // Apply Newton-Raphson step

    // Optional: Check step size for convergence as well
    if (Math.abs(delta_E) < tol) {
      // Re-calculate f_E with the final E_rad to be sure
      const final_f_E = E_rad - e * Math.sin(E_rad) - M_rad;
      if (Math.abs(final_f_E) < tol * 10) { // Allow slightly larger tolerance on final check
        return E_rad;
      }
    }

    // Ensure E stays within a reasonable range if needed, though usually not necessary for e<1
    E_rad = E_rad % (2 * Math.PI);
    if (E_rad < 0) E_rad += 2 * Math.PI;
  }
  throw new Error(`Kepler solver did not converge within ${max_iter} iterations. M=${M_rad}, e=${e}`);
}

/**
 * Calculates the true anomaly theta from the eccentric anomaly E.
 * @param {number} E_rad - Eccentric anomaly in radians.
 * @param {number} e - Eccentricity.
 * @returns {number} True anomaly theta in radians.
 */
export function calculateTrueAnomaly(E_rad, e) {
  const cosE = Math.cos(E_rad);
  const sinE = Math.sin(E_rad);
  // More robust formula for true anomaly
  const theta_rad = Math.atan2(Math.sqrt(1 - e * e) * sinE, cosE - e);
  return theta_rad;
}

/**
 * Validates inputs for the RV calculator
 * @param {Object} inputs - The input values to validate
 * @returns {Object} - { isValid: boolean, message: string if invalid }
 */
export function validateInputs(inputs) {
  const {
    P_day, e, omega0_deg, omega_dot_deg_yr, T_p_day, V_gamma_kms,
    start_period, end_period, points_per_period, kMethod, K_kms,
    m1_solar, m2_solar, i_deg
  } = inputs;

  // Essential inputs
  if (isNaN(P_day) || P_day <= 0) 
    return { isValid: false, message: "Period P must be a positive number." };
  
  if (isNaN(e) || e < 0 || e >= 1) 
    return { isValid: false, message: "Eccentricity e must be between 0 (inclusive) and 1 (exclusive)." };
  
  if (isNaN(omega0_deg)) 
    return { isValid: false, message: "Argument of Periastron ω₀ must be a number." };
  
  if (isNaN(omega_dot_deg_yr)) 
    return { isValid: false, message: "Apsidal Motion Rate dω/dt must be a number." };
  
  if (isNaN(T_p_day)) 
    return { isValid: false, message: "Time of Periastron Tₚ must be a number." };
  
  if (isNaN(V_gamma_kms)) 
    return { isValid: false, message: "Systemic Velocity Vγ must be a number." };
  
  if (isNaN(start_period) || start_period < 0) 
    return { isValid: false, message: "Start period must be non-negative." };
  
  if (isNaN(end_period) || end_period <= start_period) 
    return { isValid: false, message: "End period must be greater than start period." };
  
  if (isNaN(points_per_period) || points_per_period < 10) 
    return { isValid: false, message: "Points per period must be at least 10." };

  // Method-specific inputs
  if (kMethod === 'direct') {
    if (isNaN(K_kms) || K_kms < 0) 
      return { isValid: false, message: "Direct K value must be a non-negative number." };
  } 
  else if (kMethod === 'masses') {
    if (isNaN(m1_solar) || m1_solar <= 0) 
      return { isValid: false, message: "Primary Mass M₁ must be positive." };
    
    if (isNaN(m2_solar) || m2_solar < 0) 
      return { isValid: false, message: "Secondary Mass M₂ must be non-negative." };
    
    if (isNaN(i_deg) || i_deg < 0 || i_deg > 180) 
      return { isValid: false, message: "Inclination i must be between 0 and 180 degrees." };
  }

  return { isValid: true };
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
export function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = `Error: ${message}`;
  errorDiv.classList.remove('hidden');
  
  // Clear previous results/plot on error
  document.getElementById('resultsBadge').classList.add('hidden');
  Plotly.purge(document.getElementById('rvPlot'));
}

/**
 * Sets the loading state of the form
 * @param {boolean} isLoading - Whether the form is loading
 */
export function setLoading(isLoading) {
  const calculateButton = document.getElementById('calculateButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const calculateButtonText = document.getElementById('calculateButtonText');
  
  calculateButton.disabled = isLoading;
  
  if (isLoading) {
    loadingSpinner.classList.remove('hidden');
    calculateButtonText.textContent = 'Calculating...';
  } else {
    loadingSpinner.classList.add('hidden');
    calculateButtonText.textContent = 'Calculate & Plot RV Curve';
  }
}