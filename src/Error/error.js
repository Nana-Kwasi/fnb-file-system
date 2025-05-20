// Updated Bubble Chart Data and Options
const bubbleData = {
  datasets: [
    {
      label: "Visitor Metrics",
      data: analyticsData?.map((item, index) => {
        // Simulating visit duration between 15-60 minutes with more controlled size
        const avgDuration = Math.floor(Math.random() * 45) + 15;
        return {
          x: index, // x-axis: month index
          y: item.visits, // y-axis: number of visitors
          r: Math.min(avgDuration / 4, 15), // Cap radius size to ensure bubbles don't get too large
        };
      }) || [],
      backgroundColor: analyticsData?.map((_, index) => {
        const hue = (index * 30) % 360; // Spread colors across hue spectrum
        return `hsla(${hue}, 70%, 60%, 0.6)`; // Slightly more transparent
      }) || [],
      borderColor: analyticsData?.map((_, index) => {
        const hue = (index * 30) % 360;
        return `hsla(${hue}, 70%, 50%, 1)`;
      }) || [],
      borderWidth: 1.5,
      hoverBackgroundColor: "rgba(255, 99, 132, 0.6)",
      hoverBorderColor: "rgba(255, 99, 132, 1)",
    },
  ],
};

// Updated Bubble Chart Options
const bubbleChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10,
      right: 20,
      bottom: 10,
      left: 10
    }
  },
  plugins: {
    legend: { 
      display: true, 
      position: "top",
      labels: {
        boxWidth: 12,
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      padding: 10,
      cornerRadius: 4,
      callbacks: {
        label: function(context) {
          const month = analyticsData?.[context.dataIndex]?.month || 'Unknown';
          const visits = context.raw.y;
          const duration = context.raw.r * 4; // Convert radius back to duration
          return [
            `Month: ${month}`,
            `Visitors: ${visits}`,
            `Avg. Duration: ${duration} min`
          ];
        }
      }
    }
  },
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      min: -0.5, // Add padding to left side
      max: (analyticsData?.length - 0.5) || 11.5, // Add padding to right side
      grid: { 
        color: "rgba(0, 0, 0, 0.1)",
        drawBorder: true,
        borderDash: [5, 5],
      },
      ticks: {
        callback: function(value) {
          return analyticsData?.[value]?.month || '';
        },
        color: "#34495e", 
        font: { size: 12 }
      },
      title: {
        display: true,
        text: 'Month',
        color: '#555',
        font: { size: 14, weight: 'bold' },
        padding: { top: 10, bottom: 0 }
      },
      border: {
        display: true,
        color: 'rgba(0, 0, 0, 0.3)',
      },
    },
    y: {
      type: 'linear',
      min: 0, // Start from zero
      suggestedMax: analyticsData?.reduce((max, item) => 
        Math.max(max, item.visits * 1.25), 0) || 500, // Add 25% padding above highest value
      grid: { 
        color: "rgba(0, 0, 0, 0.1)",
        drawBorder: true,
      },
      ticks: { 
        color: "#34495e", 
        font: { size: 12 },
        stepSize: 100, // Adjust based on your data range
      },
      title: {
        display: true,
        text: 'Number of Visitors',
        color: '#555',
        font: { size: 14, weight: 'bold' },
        padding: { top: 0, bottom: 10 }
      },
      border: {
        display: true,
        color: 'rgba(0, 0, 0, 0.3)',
      },
    }
  },
  elements: {
    point: {
      borderWidth: 1.5,
      hoverRadius: 7,
      hoverBorderWidth: 2,
    }
  },
  interaction: {
    mode: 'nearest',
    intersect: true,
    axis: 'xy'
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  },
};

// Updated Scatter Chart Data
const scatterData = {
  datasets: [
    {
      label: 'Visitors by Day of Week',
      data: analyticsData?.flatMap((item, monthIndex) => {
        // Generate 4 data points per month to simulate weekly patterns
        return Array.from({ length: 4 }, (_, i) => {
          const dayOfWeek = i + 1; // 1-4 representing different days
          // Simulate varying visitor counts based on day of week pattern
          const baseVisits = item.visits / 5; // Approx visitors per day
          let modifier = 1;
          
          // Simulate weekday vs weekend patterns
          if (dayOfWeek <= 2) modifier = 1.4; // More visitors on weekdays
          else modifier = 0.7; // Fewer on weekends
          
          return {
            x: monthIndex, // x-axis: month index
            y: Math.round(baseVisits * modifier * (0.85 + Math.random() * 0.3)),
            dayLabel: ['Mon', 'Wed', 'Fri', 'Sun'][i], // For tooltip
          };
        });
      }) || [],
      backgroundColor: 'rgba(46, 204, 113, 0.7)',
      borderColor: '#2ecc71',
      borderWidth: 1.5,
      pointRadius: 6,
      pointHoverRadius: 9,
      pointStyle: 'circle',
      pointBackgroundColor: function(context) {
        // Different colors for different days of the week
        const dayIndex = context.dataIndex % 4;
        const colors = [
          'rgba(52, 152, 219, 0.8)',  // Monday - Blue
          'rgba(46, 204, 113, 0.8)',  // Wednesday - Green
          'rgba(155, 89, 182, 0.8)',  // Friday - Purple
          'rgba(241, 196, 15, 0.8)',  // Sunday - Yellow
        ];
        return colors[dayIndex];
      },
      pointBorderColor: function(context) {
        const dayIndex = context.dataIndex % 4;
        const colors = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f'];
        return colors[dayIndex];
      },
    },
  ],
};

// Updated Scatter Chart Options
const scatterChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10,
      right: 20,
      bottom: 10,
      left: 10
    }
  },
  plugins: {
    legend: { 
      display: true, 
      position: "top",
      labels: {
        boxWidth: 12,
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      padding: 10,
      cornerRadius: 4,
      callbacks: {
        label: function(context) {
          const month = analyticsData?.[context.raw.x]?.month || 'Unknown';
          const day = context.raw.dayLabel || '';
          return `${month} (${day}): ${context.raw.y} visitors`;
        },
        title: function(context) {
          return context[0].raw.dayLabel + ' Visitor Data';
        }
      }
    },
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yMin: 0,
          yMax: 0,
          borderColor: 'rgba(0, 0, 0, 0.2)',
          borderWidth: 1
        }
      }
    },
  },
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      min: -0.5, // Add padding to left side
      max: (analyticsData?.length - 0.5) || 11.5, // Add padding to right side
      grid: { 
        color: "rgba(0, 0, 0, 0.1)",
        drawBorder: true,
      },
      ticks: {
        callback: function(value) {
          return analyticsData?.[value]?.month || '';
        },
        color: "#34495e", 
        font: { size: 12 }
      },
      title: {
        display: true,
        text: 'Month',
        color: '#555',
        font: { size: 14, weight: 'bold' },
        padding: { top: 10, bottom: 0 }
      },
      border: {
        display: true,
        color: 'rgba(0, 0, 0, 0.3)',
      },
    },
    y: {
      type: 'linear',
      min: 0, // Start from zero
      suggestedMax: analyticsData?.reduce((max, item) => 
        Math.max(max, item.visits / 3 * 1.3), 0) || 200, // Add padding above highest value
      grid: { 
        color: "rgba(0, 0, 0, 0.1)",
        drawBorder: true,
      },
      ticks: { 
        color: "#34495e", 
        font: { size: 12 },
        // Force y-axis to use integer values only
        callback: function(value) {
          if (Math.floor(value) === value) {
            return value;
          }
        },
        stepSize: 50, // Adjust based on your data range
      },
      title: {
        display: true,
        text: 'Number of Visitors',
        color: '#555',
        font: { size: 14, weight: 'bold' },
        padding: { top: 0, bottom: 10 }
      },
      border: {
        display: true,
        color: 'rgba(0, 0, 0, 0.3)',
      },
    }
  },
  elements: {
    point: {
      hoverRadius: 9,
      hoverBorderWidth: 2,
    }
  },
  interaction: {
    mode: 'nearest',
    intersect: true,
    axis: 'xy'
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  },
};

// Add this to your component's return statement to style the chart containers
<style jsx>{`
  .charts-container {
    margin: 1.5rem 0;
  }
  
  .chart-container {
    position: relative;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    padding: 1.25rem;
    height: 400px;
    transition: all 0.3s ease;
  }
  
  .chart-container:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .chart-container h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eaeaea;
  }
  
  .chart-description {
    margin-bottom: 12px;
    font-size: 13px;
    color: #666;
    background-color: #f9f9f9;
    padding: 8px 12px;
    border-radius: 4px;
    border-left: 4px solid #3498db;
    text-align: center;
  }
  
  /* Legend styling - affects all charts */
  canvas {
    margin-top: 0.5rem;
  }
  
  /* Custom tooltips */
  .custom-tooltip {
    background-color: rgba(0, 0, 0, 0.8) !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    color: white !important;
    font-size: 12px !important;
    font-weight: normal !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  }
`}</style>