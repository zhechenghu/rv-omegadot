/**
 * Functions for plotting radial velocity curves
 */
import { Constants } from './constants.js';

/**
 * Creates a Plotly plot of radial velocity data
 * @param {HTMLElement} plotDiv - The DOM element to plot in
 * @param {Array} t_values - Time values array
 * @param {Array} rv_with_apsidal - RV values with apsidal motion
 * @param {Array} rv_no_apsidal - RV values without apsidal motion (optional)
 * @param {Object} params - Parameters used for calculation
 */
export function createRVPlot(plotDiv, t_values, rv_with_apsidal, rv_no_apsidal, params) {
  const { P_day, e } = params;
  const { COLORS, PLOT } = Constants;
  
  const traces = [];
  
  // Primary trace: RV with apsidal motion
  traces.push({
    x: t_values,
    y: rv_with_apsidal,
    mode: 'lines',
    name: 'RV with Apsidal Motion',
    line: {
      color: COLORS.PRIMARY,
      width: 2.5
    },
    hovertemplate: 'Time: %{x:.2f} days<br>RV: %{y:.2f} km/s<extra></extra>'
  });
  
  // Optional trace: RV without apsidal motion
  if (rv_no_apsidal) {
    traces.push({
      x: t_values,
      y: rv_no_apsidal,
      mode: 'lines',
      name: 'RV without Apsidal Motion',
      line: {
        color: COLORS.ERROR,
        width: 2,
        dash: 'dash'
      },
      hovertemplate: 'Time: %{x:.2f} days<br>RV: %{y:.2f} km/s<extra></extra>'
    });
  }
  
  // Plot layout configuration
  const layout = {
    title: {
      text: `Radial Velocity Curve (P=${P_day.toFixed(3)}d, e=${e.toFixed(3)})`,
      font: {
        family: PLOT.FONT_FAMILY,
        size: 16,
        color: '#1f2937' // gray-800
      }
    },
    xaxis: {
      title: {
        text: 'Time (Days)',
        font: {
          family: PLOT.FONT_FAMILY,
          size: PLOT.FONT_SIZE + 1,
          color: PLOT.FONT_COLOR
        }
      },
      zeroline: true,
      zerolinecolor: '#d1d5db', // gray-300
      zerolinewidth: 1,
      gridcolor: COLORS.GRID,
      tickfont: {
        family: PLOT.FONT_FAMILY,
        size: PLOT.FONT_SIZE,
        color: PLOT.FONT_COLOR
      }
    },
    yaxis: {
      title: {
        text: 'Radial Velocity (km/s)',
        font: {
          family: PLOT.FONT_FAMILY,
          size: PLOT.FONT_SIZE + 1,
          color: PLOT.FONT_COLOR
        }
      },
      zeroline: true,
      zerolinecolor: '#d1d5db', // gray-300
      zerolinewidth: 1,
      gridcolor: COLORS.GRID,
      tickfont: {
        family: PLOT.FONT_FAMILY,
        size: PLOT.FONT_SIZE,
        color: PLOT.FONT_COLOR
      }
    },
    showlegend: true,
    legend: {
      x: 0.5, // Center legend
      xanchor: 'center',
      y: -0.15, // Position below plot
      orientation: 'h', // Horizontal layout
      font: {
        family: PLOT.FONT_FAMILY,
        size: PLOT.FONT_SIZE,
        color: PLOT.FONT_COLOR
      }
    },
    margin: PLOT.MARGIN,
    hovermode: 'x unified', // Show unified tooltip for x-value
    paper_bgcolor: '#f8fafc', // Match body background
    plot_bgcolor: '#ffffff', // White plot area
    font: {
      family: PLOT.FONT_FAMILY,
      size: PLOT.FONT_SIZE,
      color: PLOT.FONT_COLOR
    },
    // Add subtle transition/animation
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    }
  };
  
  // Plotly configuration
  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'sendDataToCloud', 'autoScale2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'binary_star_rv_curve',
      height: 600,
      width: 1000,
      scale: 2
    }
  };
  
  // Use Plotly.react for efficient updates
  Plotly.react(plotDiv, traces, layout, config);
}