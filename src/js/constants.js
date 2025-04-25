/**
 * Constants and conversion factors used throughout the application
 */
export const Constants = {
  // Astronomical and Physical Constants
  AU_KM: 1.495978707e8,  // Astronomical Unit in kilometers
  DAY_S: 86400.0,        // Seconds in a day
  YEAR_DAY: 365.25,      // Days in a year (average)
  DEG_TO_RAD: Math.PI / 180.0, // Degrees to radians conversion
  RAD_TO_DEG: 180.0 / Math.PI, // Radians to degrees conversion
  
  // Plot Colors
  COLORS: {
    PRIMARY: 'rgb(55, 48, 163)', // Indigo-700
    SECONDARY: 'rgb(192, 38, 211)', // Fuchsia-600
    PRIMARY_LIGHT: 'rgba(79, 70, 229, 0.2)', // Indigo-500 with transparency
    ERROR: 'rgb(220, 38, 38)', // Red-600
    GRID: '#e5e7eb', // gray-200
  },
  
  // Plot Configuration
  PLOT: {
    DEFAULT_WIDTH: null, // Responsive width
    DEFAULT_HEIGHT: 450,
    MARGIN: { l: 60, r: 30, b: 80, t: 50 },
    FONT_FAMILY: 'Inter, sans-serif',
    FONT_SIZE: 12,
    FONT_COLOR: '#374151', // gray-700
  }
};

// Export default if needed for some environments
export default Constants;