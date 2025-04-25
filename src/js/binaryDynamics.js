/**
 * Functions for binary star dynamics calculations
 */
import { Constants } from './constants.js';
import { solveKepler, calculateTrueAnomaly } from './utils.js';

/**
 * Calculates the radial velocity semi-amplitude K1 for the primary star using masses.
 * @param {number} P_day - Orbital period in days.
 * @param {number} m1_solar - Mass of the primary star in solar masses.
 * @param {number} m2_solar - Mass of the secondary star in solar masses.
 * @param {number} i_rad - Inclination in radians.
 * @param {number} e - Eccentricity.
 * @returns {number} Radial velocity semi-amplitude K in km/s.
 */
export function calculateK(P_day, m1_solar, m2_solar, i_rad, e) {
  const { AU_KM, DAY_S, YEAR_DAY } = Constants;
  
  if (m1_solar <= 0 || m2_solar < 0 || P_day <= 0 || e < 0 || e >= 1) {
    throw new Error("Invalid input for K calculation (masses, P, or e).");
  }
  
  const P_year = P_day / YEAR_DAY;
  const total_mass_solar = m1_solar + m2_solar;
  
  if (total_mass_solar <= 0) {
    throw new Error("Total mass must be positive for K calculation.");
  }
  
  // Kepler's Third Law: a_au^3 = P_year^2 * (m1 + m2)
  const a_au = Math.pow(P_year * P_year * total_mass_solar, 1 / 3);
  
  // Semi-major axis of primary's orbit around barycenter
  const a1_au = a_au * m2_solar / total_mass_solar;

  // K = (2 * pi * a1 * sin(i)) / (P * sqrt(1 - e^2))
  const K_au_per_year = (2 * Math.PI * a1_au * Math.sin(i_rad)) / (P_year * Math.sqrt(1 - e * e));

  // Convert AU/year to km/s
  const K_kms = K_au_per_year * AU_KM / YEAR_DAY / DAY_S;
  return K_kms;
}

/**
 * Calculates radial velocity at a given time, including apsidal motion.
 * Vr = K * [cos(theta + omega(t)) + e*cos(omega(t))
 * + (P*(1-e^2)^(3/2) / (2*pi*(1+e*cos(theta)))) * omega_dot * cos(omega(t) + theta)]
 * + V_gamma
 * where omega(t) = omega0 + omega_dot * t
 *
 * Note: This implementation assumes the existence of `solveKepler(M_rad, e)` and
 * `calculateTrueAnomaly(E_rad, e)` functions.
 *
 * @param {number} t_day - Time in days.
 * @param {object} params - Object containing binary parameters:
 * @param {number} params.K_kms - Velocity semi-amplitude in km/s.
 * @param {number} params.P_day - Orbital period in days.
 * @param {number} params.e - Eccentricity (0 <= e < 1).
 * @param {number} params.omega0_rad - Argument of periastron at t=0 in radians.
 * @param {number} params.omega_dot_rad_day - Rate of apsidal motion in radians per day.
 * @param {number} params.T_p_day - Time of periastron passage in days.
 * @param {number} params.V_gamma_kms - Systemic velocity in km/s.
 * @param {number} params.n_rad_day - Mean motion in radians per day (2*pi / P_day).
 * @param {boolean} [includeApsidalMotion=true] - Whether to include the omega_dot term.
 * @returns {number} Radial velocity Vr in km/s.
 */
export function calculateRadialVelocity(t_day, params, includeApsidalMotion = true) {
  const { K_kms, P_day, e, omega0_rad, omega_dot_rad_day, T_p_day, V_gamma_kms, n_rad_day } = params;

  // Validate eccentricity
  if (e < 0 || e >= 1) {
      console.warn("Eccentricity e must be >= 0 and < 1. Received:", e);
      // Decide how to handle invalid eccentricity (e.g., return NaN, throw error, or clamp)
      // Returning NaN for now
      return NaN;
  }

  // Calculate mean anomaly M at time t
  // Ensure M is in the range [0, 2*pi) or (-pi, pi] depending on solver assumptions
  const M_rad_raw = n_rad_day * (t_day - T_p_day);
  const M_rad = M_rad_raw % (2 * Math.PI); // Normalize M to [0, 2*pi) or similar range if needed by solver

  // Solve Kepler's equation for eccentric anomaly E
  // Assumes solveKepler function is defined elsewhere and handles M_rad correctly
  const E_rad = solveKepler(M_rad, e);

  // Calculate true anomaly theta
  // Assumes calculateTrueAnomaly function is defined elsewhere
  const theta_rad = calculateTrueAnomaly(E_rad, e);

  // Calculate argument of periastron omega at time t
  // omega(t) = omega0 + omega_dot * t if including apsidal motion
  const omega_t_rad = omega0_rad + (includeApsidalMotion ? omega_dot_rad_day * t_day : 0);

  // --- Calculate terms for the radial velocity formula ---

  // Standard terms: cos(theta + omega(t)) + e*cos(omega(t))
  let vr_bracket_term = Math.cos(theta_rad + omega_t_rad) + e * Math.cos(omega_t_rad);

  // Apsidal motion term: (P*(1-e^2)^(3/2) / (2*pi*(1+e*cos(theta)))) * omega_dot * cos(omega(t) + theta)
  // Add this term only if requested and omega_dot is non-zero
  if (includeApsidalMotion && omega_dot_rad_day !== 0) {
    // Check for division by zero or near-zero if e is close to 1 and theta is near pi
    const denominator = 1 + e * Math.cos(theta_rad);
    if (Math.abs(denominator) < 1e-9) {
        // Handle potential singularity, e.g., if e=1 (parabolic) or near collision
        console.warn("Potential singularity: denominator (1 + e*cos(theta)) is close to zero.");
        // Depending on context, might return NaN, throw error, or use a limiting value
        return NaN; // Or handle appropriately
    }

    const factor = (P_day * Math.pow(1 - e * e, 1.5)) / (2 * Math.PI * denominator);
    const apsidal_contribution = factor * omega_dot_rad_day * Math.cos(omega_t_rad + theta_rad);

    vr_bracket_term += apsidal_contribution;
  }

  // --- Final radial velocity calculation ---
  // Vr = K * [ sum of terms ] + V_gamma
  const Vr_kms = K_kms * vr_bracket_term + V_gamma_kms;

  return Vr_kms;
}

/**
 * Generates time and RV data for plotting
 * @param {object} params - Object containing binary parameters
 * @param {number} start_period - Start period number
 * @param {number} end_period - End period number
 * @param {number} points_per_period - Number of points per period
 * @param {boolean} includeNoApsidal - Whether to include data without apsidal motion
 * @returns {object} Data for plotting: { t_values, rv_with_apsidal, rv_no_apsidal }
 */
export function generateRVData(params, start_period, end_period, points_per_period, includeNoApsidal = false) {
  const { P_day } = params;
  
  // Generate time points
  const t_start = start_period * P_day;
  const t_end = end_period * P_day;
  const num_periods = end_period - start_period;
  const num_points = Math.max(num_periods * points_per_period, 50); // Ensure minimum points
  const t_values = Array.from({ length: num_points }, (_, i) => t_start + (i / (num_points - 1)) * (t_end - t_start));
  
  // Calculate RV values with apsidal motion
  const rv_with_apsidal = t_values.map(t => calculateRadialVelocity(t, params, true));
  
  // Optionally calculate RV values without apsidal motion
  let rv_no_apsidal = null;
  if (includeNoApsidal) {
    rv_no_apsidal = t_values.map(t => calculateRadialVelocity(t, params, false));
  }
  
  return {
    t_values,
    rv_with_apsidal,
    rv_no_apsidal
  };
}