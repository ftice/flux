document.getElementById('generate').addEventListener('click', generateColors);
document.getElementById('exponent').addEventListener('input', updateChart);

const canvas = document.getElementById('curve-chart');
const container = document.querySelector('.chart-container');
const ctx = canvas.getContext('2d');
let chart;

function setDimensions() {
  const width = container.clientWidth;
  canvas.width = width;
  canvas.height = width; // Set height equal to width for square aspect ratio
}

function generateColors() {
  const baseColor = document.getElementById('base-color').value;
  const exponent = parseFloat(document.getElementById('exponent').value);
  const numColors = parseInt(document.getElementById('num-colors').value); // Get user-defined number of colors

  console.log('Base color:', baseColor);
  console.log('Exponent:', exponent);
  console.log('Number of colors:', numColors);

  const colorContainer = document.getElementById('color-container');
  colorContainer.innerHTML = ''; // Clear previous colors

  const base = chroma(baseColor);

  for (let i = 0; i < numColors; i++) {
    const factor = i / (numColors - 1); // Normalize to range [0, 1]
    const lightness = -(Math.pow(factor, exponent)) + 1; // Apply the inversion
    const hclBase = chroma(base).hcl(); // Convert the base color to HCL
    // Adjust lightness
    hclBase[2] = lightness * 100; // Lightness is in the range [0, 100]
    const color = chroma(hclBase, 'hcl'); // Convert back to hex for display

    const colorString = color.hex();
    console.log(`Color ${i}:`, colorString);

    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = colorString;

    // Create a span element to display the hex code
    const hexCode = document.createElement('span');
    hexCode.className = 'hex-code';
    hexCode.textContent = colorString;

    // Check luminance and set text color accordingly
    const luminance = color.luminance();
    hexCode.style.color = luminance > 0.5 ? '#1a1a1a' : 'white';

    // Add click event listener to copy hexcode to clipboard
    colorBox.addEventListener('click', () => {
      navigator.clipboard.writeText(colorString)
        .then(() => {
          showNotification('Copied to clipboard');
        })
        .catch((err) => {
          console.error('Error copying to clipboard:', err);
        });
    });

    colorBox.appendChild(hexCode);
    colorContainer.appendChild(colorBox);
  }
}

function updateChart() {
  const exponent = parseFloat(document.getElementById('exponent').value);
  const factors = [];
  const fixedNumColors = 20; // Using a fixed number of points for the chart

  for (let i = 0; i < fixedNumColors; i++) {
    factors.push(i / (fixedNumColors - 1));
  }

  const data = factors.map(f => Math.pow(f, exponent)).map(value => 1 - value); // Invert the values
  const linearData = factors.map(f => 1 - f); // Linear data from 1 to 0

  if (chart) {
    // Update existing chart datasets
    chart.data.datasets[0].data = data;
    chart.data.datasets[1].data = linearData;
    chart.update(); // Update the chart to reflect new data
  } else {
    // Create the chart if it doesn't exist
    setDimensions(); // Ensure the canvas is correctly sized before initial draw
    drawChart(factors, data, linearData, exponent);
  }
}

function drawChart(factors, data, linearData, exponent) {
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: factors.map(f => f.toFixed(2)), // Format labels for clarity
      datasets: [
        {
          label: `Curve with exponent ${exponent}`,
          data: data,
          borderColor: '#1a1a1a',
          borderWidth: 1.5, // Custom border width
          pointRadius: 0, // Custom radius for data points
        },
        {
          label: 'Linear Reference',
          data: linearData,
          borderColor: '#e6e6e6',
          borderWidth: 1, // Slightly smaller width for differentiation
          borderDash: [4, 5], // Dashed line for linear reference
          pointRadius: 0, // No points on this line
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Important to allow chart to stretch
      scales: {
        x: {
          title: {
            display: true,
            text: 'Range',
            font: {
              size: 12, // Custom font size
              family: 'Public Sans', // Custom font family
            }
          },
          grid: {
            display: false // Hide the x-axis grid lines
          },
          ticks: {
            display: false // Hide the ticks
          }
        },
        y: {
          title: {
            display: true,
            text: 'Perceived Lightness',
            font: {
              size: 12, // Custom font size
              family: 'Public Sans', // Custom font family
            }
          },
          grid: {
            display: false // Hide the y-axis grid lines
          },
          ticks: {
            display: false // Hide the ticks
          }
        }
      },
      plugins: {
        legend: {
          display: false,
        }
      }
    }
  });
}

// Show notification at the bottom of the screen
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 1500); // Remove after 1.5 seconds
}

// Initialize the chart on page load
document.addEventListener('DOMContentLoaded', () => {
  setDimensions(); // Ensure the canvas is correctly sized initially
  updateChart();
});

// Handle window resize event
window.addEventListener('resize', () => {
  setDimensions();
  if (chart) {
    chart.resize(); // Ensure chart resizes properly
  }
});
