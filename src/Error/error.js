import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useVisitor } from "../context/VisitorContext";
import "../ana.css";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState("bar");

  // Get data from context instead of Firebase
  const { branchData } = useVisitor();

  const filterCurrentYearData = (data) => {
    const currentYear = new Date().getFullYear();
    return data.filter(log => {
      if (log.date) {
        const logDate = new Date(log.date);
        return !isNaN(logDate.getTime()) && logDate.getFullYear() === currentYear;
      }
      return false;
    });
  };

  useEffect(() => {
    try {
      // Use allVisitorsData from context instead of fetching from Firebase
      const allData = branchData.allVisitorsData || [];

      // Filter data for current year
      const currentYearData = filterCurrentYearData(allData);

      // Group data by month
      const groupedData = currentYearData.reduce(
        (acc, log) => {
          if (log.date) {
            const date = new Date(log.date);
            if (!isNaN(date.getTime())) {
              const month = date.toLocaleString("default", { month: "short" });
              acc.chartData[month] = (acc.chartData[month] || 0) + 1;
              
              // For weekday distribution
              const weekday = date.toLocaleString("default", { weekday: "short" });
              acc.weekdayData[weekday] = (acc.weekdayData[weekday] || 0) + 1;
              
              // For hour distribution (for histogram)
              const hour = date.getHours();
              acc.hourData[hour] = (acc.hourData[hour] || 0) + 1;
            }
          }
          
          // For company distribution
          if (log.company) {
            acc.companyData[log.company] = (acc.companyData[log.company] || 0) + 1;
          }
          
          acc.tableData.push({
            name: log.name || "N/A",
            company: log.company || "N/A",
            date: log.date || "Invalid Date",
          });
          return acc;
        },
        { chartData: {}, tableData: [], weekdayData: {}, hourData: {}, companyData: {} }
      );

      // Ensure all months are represented with 0 if no data
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const completeChartData = {};
      months.forEach(month => {
        completeChartData[month] = groupedData.chartData[month] || 0;
      });

      // Convert grouped data to arrays for ApexCharts
      const chartDataArray = Object.entries(completeChartData).map(
        ([month, visits]) => ({
          month,
          visits,
        })
      );
      
      // Prepare weekday data
      const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weekdayDataArray = weekdays.map(day => 
        groupedData.weekdayData[day] || 0
      );
      
      // Prepare hour data for histogram
      const hourDataArray = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: groupedData.hourData[i] || 0
      }));
      
      // Prepare bubble chart data (month, day of month, visits)
      const bubbleData = currentYearData.reduce((acc, log) => {
        if (log.date) {
          const date = new Date(log.date);
          if (!isNaN(date.getTime())) {
            const month = date.getMonth();
            const day = date.getDate();
            
            // Check if we already have this day
            const existingIdx = acc.findIndex(item => 
              item.month === month && item.day === day
            );
            
            if (existingIdx >= 0) {
              acc[existingIdx].visits += 1;
            } else {
              acc.push({ month, day, visits: 1 });
            }
          }
        }
        return acc;
      }, []);
      
      // Top 5 companies for radar chart
      const companyDataArray = Object.entries(groupedData.companyData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([company, count]) => ({
          company,
          count
        }));

      setAnalyticsData({
        monthly: chartDataArray,
        weekday: weekdayDataArray,
        hourly: hourDataArray,
        bubble: bubbleData,
        companies: companyDataArray
      });
      setTableData(groupedData.tableData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing analytics data:", err);
      setError("Failed to process analytics data.");
      setLoading(false);
    }
  }, [branchData.allVisitorsData]); // Depend on allVisitorsData from context

  // Prepare data for various charts
  const chartSeries = analyticsData.monthly ? [
    {
      name: "Visits",
      data: analyticsData.monthly.map(item => item.visits),
    },
  ] : [];
  
  const chartCategories = analyticsData.monthly ? 
    analyticsData.monthly.map(item => item.month) : [];

  const pieSeries = analyticsData.monthly ? 
    analyticsData.monthly.map(item => item.visits) : [];
    
  const weekdaySeries = analyticsData.weekday ? [
    {
      name: "Visits by Day",
      data: analyticsData.weekday,
    }
  ] : [];
  
  const hourlyHistogramSeries = analyticsData.hourly ? [
    {
      name: "Visits",
      data: analyticsData.hourly.map(item => item.count)
    }
  ] : [];
  
  const bubbleSeries = analyticsData.bubble ? [
    {
      name: "Visits",
      data: analyticsData.bubble.map(item => ({
        x: item.month,
        y: item.day,
        z: item.visits * 10 // Scale for better visibility
      }))
    }
  ] : [];
  
  const radarSeries = analyticsData.companies ? [
    {
      name: "Company Visits",
      data: analyticsData.companies.map(item => item.count)
    }
  ] : [];
  
  const radarCategories = analyticsData.companies ?
    analyticsData.companies.map(item => item.company) : [];

  const totalVisits = analyticsData.monthly ? 
    analyticsData.monthly.reduce((sum, item) => sum + item.visits, 0) : 0;

  // Generate scatter plot data
  const generateScatterData = () => {
    if (!analyticsData.monthly) return [];
    
    return analyticsData.monthly.map((item, index) => ({
      x: index,
      y: item.visits,
    }));
  };
  
  const scatterSeries = [
    {
      name: "Monthly Distribution",
      data: generateScatterData()
    }
  ];

  const renderCurrentChart = () => {
    switch(activeTab) {
      case "bar":
        return (
          <ReactApexChart
            type="bar"
            series={chartSeries}
            options={{
              chart: { 
                animations: { enabled: true },
                toolbar: { show: true }
              },
              xaxis: {
                categories: chartCategories,
                title: { text: "Months" },
              },
              yaxis: {
                title: { text: "Number of Visits" },
              },
              plotOptions: {
                bar: {
                  borderRadius: 5,
                  columnWidth: "50%",
                  distributed: false,
                  dataLabels: {
                    position: "top"
                  }
                },
              },
              colors: ["#00A36C"],
              title: {
                text: `Monthly Visitor Trends ${new Date().getFullYear()}`,
                align: "center",
                style: { fontSize: "16px" }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val;
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"]
                }
              },
              tooltip: { 
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              },
              grid: {
                borderColor: "#e7e7e7",
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                }
              },
            }}
            height={350}
          />
        );
      case "line":
        return (
          <ReactApexChart
            type="line"
            series={chartSeries}
            options={{
              chart: {
                animations: { enabled: true },
                dropShadow: {
                  enabled: true,
                  color: "#000",
                  top: 18,
                  left: 7,
                  blur: 10,
                  opacity: 0.2
                },
                toolbar: { show: true }
              },
              xaxis: {
                categories: chartCategories,
                title: { text: "Months" },
              },
              yaxis: {
                title: { text: "Number of Visits" },
              },
              colors: ["#FF4560"],
              title: { 
                text: `Monthly Visitor Trends ${new Date().getFullYear()}`, 
                align: "center",
                style: { fontSize: "16px" }
              },
              stroke: { 
                curve: "smooth", 
                width: 3
              },
              markers: {
                size: 6,
                strokeWidth: 0,
                hover: {
                  size: 9
                }
              },
              tooltip: { 
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              },
              grid: {
                borderColor: "#e7e7e7",
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                }
              },
            }}
            height={350}
          />
        );
      case "pie":
        return (
          <ReactApexChart
            type="pie"
            series={pieSeries}
            options={{
              labels: chartCategories,
              colors: [
                "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
                "#3F51B5", "#546E7A", "#D4526E", "#8D5B4C", "#F86624", 
                "#D7263D", "#1B998B"
              ],
              title: { 
                text: `Monthly Visitor Distribution ${new Date().getFullYear()}`, 
                align: "center",
                style: { fontSize: "16px" }
              },
              tooltip: { theme: "dark" },
              legend: { 
                position: "bottom",
                formatter: function(seriesName, opts) {
                  return [seriesName, " - ", opts.w.globals.series[opts.seriesIndex], " visits"];
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                  return Math.round(val) + "%";
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 300
                  },
                  legend: {
                    position: "bottom"
                  }
                }
              }]
            }}
            height={350}
          />
        );
      case "histogram":
        return (
          <ReactApexChart
            type="bar"
            series={hourlyHistogramSeries}
            options={{
              chart: {
                type: "bar",
                animations: { enabled: true },
                toolbar: { show: true }
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  columnWidth: "85%",
                  dataLabels: {
                    position: "top"
                  }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val > 0 ? val : "";
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"]
                }
              },
              xaxis: {
                categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                title: { text: "Hour of Day" },
              },
              yaxis: {
                title: { text: "Number of Visits" }
              },
              title: {
                text: "Visits Distribution by Hour of Day (Histogram)",
                align: "center",
                style: { fontSize: "16px" }
              },
              colors: ["#17A2B8"],
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              },
              grid: {
                borderColor: "#e7e7e7",
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                }
              }
            }}
            height={350}
          />
        );
      case "bubble":
        return (
          <ReactApexChart
            type="bubble"
            series={bubbleSeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true },
                zoom: { enabled: true }
              },
              xaxis: {
                title: { text: "Month" },
                tickAmount: 12,
                labels: {
                  formatter: function(val) {
                    return months[Math.floor(val)];
                  }
                },
                min: -0.5,
                max: 11.5
              },
              yaxis: {
                title: { text: "Day of Month" },
                max: 31,
                min: 0
              },
              title: {
                text: "Visitor Bubble Chart (Month vs Day)",
                align: "center",
                style: { fontSize: "16px" }
              },
              fill: {
                type: "gradient",
                gradient: {
                  shade: "dark",
                  type: "vertical",
                  shadeIntensity: 0.5,
                  inverseColors: true,
                  opacityFrom: 1,
                  opacityTo: 0.8,
                  stops: [0, 100]
                }
              },
              colors: ["#6236FF"],
              tooltip: {
                theme: "dark",
                x: {
                  formatter: function(val) {
                    return months[Math.floor(val)];
                  }
                },
                z: {
                  formatter: function(val) {
                    return Math.floor(val/10) + " visits";
                  },
                  title: "Visits:"
                }
              }
            }}
            height={350}
          />
        );
      case "scatter":
        return (
          <ReactApexChart
            type="scatter"
            series={scatterSeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true },
                zoom: { type: "xy" }
              },
              xaxis: {
                title: { text: "Month Index" },
                tickAmount: 12,
                labels: {
                  formatter: function(val) {
                    return chartCategories[Math.floor(val)] || "";
                  }
                }
              },
              yaxis: {
                title: { text: "Number of Visits" }
              },
              title: {
                text: "Monthly Visits Scatter Plot",
                align: "center",
                style: { fontSize: "16px" }
              },
              colors: ["#FF6B6B"],
              markers: {
                size: [10, 15],
                strokeWidth: 0
              },
              tooltip: {
                theme: "dark",
                x: {
                  formatter: function(val) {
                    return chartCategories[Math.floor(val)] || "";
                  }
                },
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "radar":
        return (
          <ReactApexChart
            type="radar"
            series={radarSeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: false },
                dropShadow: {
                  enabled: true,
                  blur: 1,
                  left: 1,
                  top: 1
                }
              },
              title: {
                text: "Top Companies by Visits",
                align: "center",
                style: { fontSize: "16px" }
              },
              xaxis: {
                categories: radarCategories
              },
              fill: {
                opacity: 0.7
              },
              stroke: {
                width: 2
              },
              colors: ["#7B68EE"],
              markers: {
                size: 5,
                hover: {
                  size: 10
                }
              },
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "heatmap":
        return (
          <ReactApexChart
            type="heatmap"
            series={[
              {
                name: "Jan",
                data: generateHeatmapData(0)
              },
              {
                name: "Feb",
                data: generateHeatmapData(1)
              },
              {
                name: "Mar",
                data: generateHeatmapData(2)
              },
              {
                name: "Apr",
                data: generateHeatmapData(3)
              }
            ]}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true }
              },
              plotOptions: {
                heatmap: {
                  shadeIntensity: 0.5,
                  colorScale: {
                    ranges: [
                      {
                        from: 0,
                        to: 10,
                        name: "low",
                        color: "#00A100"
                      },
                      {
                        from: 11,
                        to: 20,
                        name: "medium",
                        color: "#FFB200"
                      },
                      {
                        from: 21,
                        to: 50,
                        name: "high",
                        color: "#FF0000"
                      }
                    ]
                  }
                }
              },
              dataLabels: {
                enabled: false
              },
              title: {
                text: "Visitor Heat Map (Week Days x Months)",
                align: "center",
                style: { fontSize: "16px" }
              },
              xaxis: {
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              },
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "weekday":
        return (
          <ReactApexChart
            type="bar"
            series={weekdaySeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true }
              },
              plotOptions: {
                bar: {
                  borderRadius: 5,
                  columnWidth: "60%",
                  dataLabels: {
                    position: "top"
                  }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val;
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"]
                }
              },
              xaxis: {
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                title: { text: "Day of Week" }
              },
              yaxis: {
                title: { text: "Number of Visits" }
              },
              title: {
                text: "Visits Distribution by Day of Week",
                align: "center",
                style: { fontSize: "16px" }
              },
              colors: ["#FF9800"],
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "radialbar":
        return (
          <ReactApexChart
            type="radialBar"
            series={analyticsData.companies ? 
              analyticsData.companies.map(item => item.count) : []}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: false }
              },
              plotOptions: {
                radialBar: {
                  dataLabels: {
                    name: {
                      fontSize: "16px",
                    },
                    value: {
                      fontSize: "14px",
                    },
                    total: {
                      show: true,
                      label: "Total",
                      formatter: function() {
                        return analyticsData.companies ? 
                          analyticsData.companies.reduce((sum, item) => sum + item.count, 0) : 0;
                      }
                    }
                  },
                  hollow: {
                    size: "40%"
                  },
                  track: {
                    background: "#f2f2f2"
                  }
                }
              },
              labels: radarCategories,
              colors: ["#20c997", "#6f42c1", "#fd7e14", "#e83e8c", "#007bff"],
              title: {
                text: "Top Companies - Radial View",
                align: "center",
                style: { fontSize: "16px" }
              },
              legend: {
                show: true,
                position: "bottom"
              }
            }}
            height={350}
          />
        );
      default:
        return null;
    }
  };
  
  // Mock function to generate heatmap data
  const generateHeatmapData = (monthIndex) => {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return weekdays.map(day => {
      return {
        x: day,
        y: Math.floor(Math.random() * 30) + 5
      };
    });
  };
  
  // Array of months for charts
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="analytics">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error">{error}</p>
        </div>
      ) : (
        <>
          <div className="analytics-header">
            <h2>Analytics Dashboard</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <h3>{totalVisits}</h3>
                <p>Total Visits</p>
              </div>
              <div className="stat-card">
                <h3>{analyticsData.monthly ? analyticsData.monthly.reduce((max, item) => 
                  item.visits > max ? item.visits : max, 0) : 0}</h3>
                <p>Peak Month</p>
              </div>
              <div className="stat-card">
                <h3>{analyticsData.companies ? analyticsData.companies.length : 0}</h3>
                <p>Companies</p>
              </div>
              <div className="stat-card">
                <h3>{tableData.length}</h3>
                <p>Unique Visitors</p>
              </div>
            </div>
          </div>

          <div className="chart-tabs">
            <button 
              className={activeTab === "bar" ? "active" : ""} 
              onClick={() => setActiveTab("bar")}
            >
              Bar
            </button>
            <button 
              className={activeTab === "line" ? "active" : ""} 
              onClick={() => setActiveTab("line")}
            >
              Line
            </button>
            <button 
              className={activeTab === "pie" ? "active" : ""} 
              onClick={() => setActiveTab("pie")}
            >
              Pie
            </button>
            <button 
              className={activeTab === "histogram" ? "active" : ""} 
              onClick={() => setActiveTab("histogram")}
            >
              Histogram
            </button>
            <button 
              className={activeTab === "bubble" ? "active" : ""} 
              onClick={() => setActiveTab("bubble")}
            >
              Bubble
            </button>
            <button 
              className={activeTab === "scatter" ? "active" : ""} 
              onClick={() => setActiveTab("scatter")}
            >
              Scatter
            </button>
            <button 
              className={activeTab === "radar" ? "active" : ""} 
              onClick={() => setActiveTab("radar")}
            >
              Radar
            </button>
            <button 
              className={activeTab === "heatmap" ? "active" : ""} 
              onClick={() => setActiveTab("heatmap")}
            >
              Heatmap
            </button>
            <button 
              className={activeTab === "weekday" ? "active" : ""} 
              onClick={() => setActiveTab("weekday")}
            >
              Weekday
            </button>
            <button 
              className={activeTab === "radialbar" ? "active" : ""} 
              onClick={() => setActiveTab("radialbar")}
            >
              RadialBar
            </button>
          </div>

          <div className="chart-container">
            {renderCurrentChart()}
          </div>

          {/* Data Table */}
          <div className="table-section">
            <h3>Detailed Visitor Data</h3>
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData
                    .slice(0, showAll ? tableData.length : 5)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.company}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <button 
              className="view-all-btn" 
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;




//css
/* Add this to your ana.css file */

.analytics {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.analytics-header {
  margin-bottom: 30px;
}

.analytics-header h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 28px;
  color: #4a90e2;
  margin: 0 0 10px 0;
}

.stat-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.chart-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.chart-tabs button {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  color: #333;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.chart-tabs button:hover {
  background-color: #e0e0e0;
}

.chart-tabs button.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.chart-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.table-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 15px;
}

.analytics-table {
  width: 100%;
  border-collapse: collapse;
}

.analytics-table th,
.analytics-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.analytics-table th {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
}

.analytics-table tr:hover {
  background-color: #f5f5f5;
}

.view-all-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.view-all-btn:hover {
  background-color: #3a7bc8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  padding: 20px;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  margin: 20px 0;
}

.error {
  color: #f5222d;
  margin: 0;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .stat-card {
    min-width: 140px;
  }
  
  .chart-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .chart-tabs button {
    flex: 0 0 auto;
  }
}

//dashboard

import React, { useState, useEffect, useRef } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineLogout, AiOutlineDown, AiOutlinePieChart } from "react-icons/ai";
import { Line, Bar, Pie, Scatter, Bubble } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { useVisitor } from "../context/VisitorContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BubbleController,
} from "chart.js";
import "../dashboard.css";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, // Register ArcElement for Pie chart
  Title, 
  Tooltip, 
  Legend,
  RadialLinearScale, // Register RadialLinearScale for RadialBar chart
  BubbleController // Register BubbleController for Bubble chart
);

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Use the visitor context
  const { 
    selectedBranch, 
    branchData, 
    selectedBranchName,
    loading, 
    error, 
    authenticated,
    logout,
    user
  } = useVisitor();

  const { 
    analyticsData, 
    totalVisitors, 
    visitorsToday, 
    todayVisitorsData 
  } = branchData;

  // Check if user is authenticated
  useEffect(() => {
    if (!authenticated && !loading) {
      navigate("/login");
    }
  }, [authenticated, loading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const fetchTodayVisitors = () => {
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      calendarDays.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          {day}
        </div>
      );
    }
    return calendarDays;
  };

  const barData = {
    labels: analyticsData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Visitors",
        data: analyticsData?.map((item) => item.visits) || [],
        backgroundColor: "rgba(41, 128, 185, 0.7)",
        borderColor: "#2980b9",
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: analyticsData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Visitors",
        data: analyticsData?.map((item) => item.visits) || [],
        backgroundColor: "rgba(26, 188, 156, 0.2)",
        borderColor: "#1abc9c",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Pie chart data using the same analytics data
  const pieData = {
    labels: analyticsData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Visitors Distribution",
        data: analyticsData?.map((item) => item.visits) || [],
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',  // Blue
          'rgba(46, 204, 113, 0.8)',  // Green
          'rgba(155, 89, 182, 0.8)',  // Purple
          'rgba(241, 196, 15, 0.8)',  // Yellow
          'rgba(231, 76, 60, 0.8)',   // Red
          'rgba(230, 126, 34, 0.8)',  // Orange
          'rgba(26, 188, 156, 0.8)',  // Turquoise
          'rgba(52, 73, 94, 0.8)',    // Dark blue
          'rgba(149, 165, 166, 0.8)', // Gray
          'rgba(243, 156, 18, 0.8)',  // Orange-yellow
          'rgba(211, 84, 0, 0.8)',    // Dark orange
          'rgba(22, 160, 133, 0.8)',  // Dark turquoise
        ],
        borderColor: [
          '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', 
          '#e74c3c', '#e67e22', '#1abc9c', '#34495e',
          '#95a5a6', '#f39c12', '#d35400', '#16a085',
        ],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  // RadialBar chart data (implemented as a polar area chart)
  const radialBarData = {
    labels: analyticsData?.map((item) => item.month).slice(0, 6) || [],
    datasets: [
      {
        label: 'Visitor Distribution',
        data: analyticsData?.map((item) => item.visits).slice(0, 6) || [],
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(230, 126, 34, 0.7)',
        ],
        borderWidth: 1,
        borderColor: [
          '#3498db', '#2ecc71', '#9b59b6', 
          '#f1c40f', '#e74c3c', '#e67e22',
        ],
      }
    ],
  };

  // Scatter chart data
  const scatterData = {
    datasets: [
      {
        label: 'Day vs. Visitors',
        data: analyticsData?.map((item, index) => ({
          x: index + 1,  // Day/position in the dataset
          y: item.visits,  // Number of visitors
        })) || [],
        backgroundColor: 'rgba(41, 128, 185, 0.8)',
        borderColor: '#2980b9',
        pointRadius: 8,
        pointHoverRadius: 12,
      }
    ],
  };

  // Bubble chart data
  const bubbleData = {
    datasets: [
      {
        label: 'Month Visitors (Bubble Size = Relative Importance)',
        data: analyticsData?.map((item, index) => ({
          x: index + 1,  // Position in month sequence
          y: item.visits,  // Number of visitors
          r: Math.sqrt(item.visits) / 2,  // Radius proportional to visits
        })) || [],
        backgroundColor: analyticsData?.map((_, index) => {
          const colors = [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(230, 126, 34, 0.7)',
            'rgba(26, 188, 156, 0.7)',
            'rgba(52, 73, 94, 0.7)',
            'rgba(149, 165, 166, 0.7)',
            'rgba(243, 156, 18, 0.7)',
            'rgba(211, 84, 0, 0.7)',
            'rgba(22, 160, 133, 0.7)',
          ];
          return colors[index % colors.length];
        }),
        borderColor: '#2980b9',
      }
    ],
  };

  // Histogram data (implemented as a special bar chart)
  // We'll create frequency buckets from the visitor data
  const createHistogramData = () => {
    if (!analyticsData || analyticsData.length === 0) return null;
    
    const visitorCounts = analyticsData.map(item => item.visits);
    const min = Math.min(...visitorCounts);
    const max = Math.max(...visitorCounts);
    
    // Create 5 bins for the histogram
    const binSize = Math.ceil((max - min) / 5);
    const bins = Array(5).fill(0);
    
    // Count visitors in each bin
    visitorCounts.forEach(count => {
      const binIndex = Math.min(Math.floor((count - min) / binSize), 4);
      bins[binIndex]++;
    });
    
    // Create labels for bins
    const labels = [];
    for (let i = 0; i < 5; i++) {
      const lowerBound = min + (i * binSize);
      const upperBound = min + ((i + 1) * binSize);
      labels.push(`${lowerBound}-${upperBound}`);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Frequency of Visitor Counts',
          data: bins,
          backgroundColor: 'rgba(155, 89, 182, 0.7)',
          borderColor: '#8e44ad',
          borderWidth: 1,
        }
      ]
    };
  };
  
  const histogramData = createHistogramData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
    },
    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#34495e", font: { size: 12 } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#34495e", font: { size: 17 } },
      },
    },
  };
  
  // Pie chart options - Updated to arrange months horizontally
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: "bottom", // Changed from "right" to "bottom" for horizontal arrangement
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} visitors (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Visitor Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 10
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold'
        },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return percentage + '%';
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    },
    cutout: '30%',
    radius: '90%'
  };

  // Radial bar options
  const radialBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Visitor Distribution by Month',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} visitors`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          display: false
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  // Scatter chart options
  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const month = analyticsData && analyticsData[index] ? analyticsData[index].month : 'Unknown';
            return `${month}: ${context.raw.y} visitors`;
          }
        }
      },
      title: {
        display: true,
        text: 'Visitor Distribution (Scatter)',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month Index'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Visitors'
        },
        beginAtZero: true
      }
    }
  };

  // Bubble chart options
  const bubbleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const month = analyticsData && analyticsData[index] ? analyticsData[index].month : 'Unknown';
            return `${month}: ${context.raw.y} visitors`;
          }
        }
      },
      title: {
        display: true,
        text: 'Visitor Volume by Month (Bubble)',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month Index'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Visitors'
        },
        beginAtZero: true
      }
    }
  };

  // Histogram options
  const histogramOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Visitor Count Distribution (Histogram)',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Visitor Count Ranges'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Frequency (Number of Months)'
        },
        beginAtZero: true
      }
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Use name from user object if available
    if (user.name) {
      // Format "Lastname, Firstname" to "Firstname Lastname"
      const nameParts = user.name.split(', ');
      if (nameParts.length === 2) {
        return `${nameParts[1]} ${nameParts[0]}`;
      }
      return user.name;
    }
    
    // Fallback to email or userId
    return user.email || user.userId || '';
  };

  // Get user title or role
  const getUserTitle = () => {
    if (!user) return '';
    return user.title || user.role || '';
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>FNB LOGS ADMIN DASHBOARD FOR {selectedBranchName}</h1>
        
        {selectedBranch && (
          <div className="branch-display">
          </div>
        )}
        
        {/* User profile dropdown */}
        <div className="user-profile-dropdown" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="dropdown-button"
          >
            <img 
              src="/user.png" 
              alt="User Profile" 
              className="profile-icon" 
            />
            {getUserEmail() || 'User Profile'}
            <AiOutlineDown className="dropdown-arrow" />
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-content">
              <div className="dropdown-header">
                <div className="user-name">{getUserDisplayName()}</div>
                <div className="user-title">{getUserTitle()}</div>
                <div className="user-email">{getUserEmail()}</div>
                {user && user.userId && (
                  <div className="user-id">ID: {user.userId}</div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                <AiOutlineLogout className="logout-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div className="calendar-container">
            <div className="calendar-header">
              <h2>Calendar</h2>
              <div className="calendar-nav">
                <button onClick={previousMonth}>
                  <AiOutlineLeft />
                </button>
                <span>
                  {new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth()
                  ).toLocaleString("default", { month: "long" })}{" "}
                  {currentDate.getFullYear()}
                </span>
                <button onClick={nextMonth}>
                  <AiOutlineRight />
                </button>
              </div>
            </div>
            <div className="calendar-grid">{generateCalendarDays()}</div>
          </div>
  
          {/* Stats and Pie Chart Container */}
          <div className="stats-and-pie-container">
            <div className="stats">
              <div className="stat-card visitors-today" onClick={fetchTodayVisitors}>
                <img src="/user (1).png" alt="Visitors Today" className="stat-icon" />
                <h3>Visitors Today</h3>
                <p>{visitorsToday}</p>
                {selectedBranchName && <span className="branch-indicator">{selectedBranchName}</span>}
              </div>
               
              <div className="stat-card total-visitors">
                <img src="/group.png" alt="Total Visitors" className="stat-icon" />
                <h3>Total Visitors</h3>
                <p>{totalVisitors}</p>
                {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
              </div>
              
              <div className="stat-card special">
                <img src="/diversity.png" alt="Peak Month" className="stat-icon" />
                <h3>Peak Month</h3>
                {analyticsData && analyticsData.length > 0 ? (
                  <>
                    <p>
                      {analyticsData.reduce((max, item) => (item.visits > max.visits ? item : max), analyticsData[0]).month}
                    </p>
                    <span className="peak-visitors">
                      {analyticsData.reduce((max, item) => (item.visits > max.visits ? item : max), analyticsData[0]).visits} visitors
                    </span>
                  </>
                ) : (
                  <p>No data available</p>
                )}
                {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
              </div>
            </div>
  
            {/* Pie Chart */}
            <div className="pie-chart-container">
              <h3>
                Visitor Distribution {selectedBranch ? `- ${selectedBranchName}` : ''}
              </h3>
              <div className="pie-chart-wrapper">
                <Pie data={pieData} options={pieChartOptions} />
              </div>
            </div>
          </div>
  
          <div className="charts-container">
            <div className="charts">
              <div className="chart-container">
                <h3>
                  Monthly Visitors {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <Line data={lineData} options={chartOptions} />
              </div>
              <div className="chart-container">
                <h3>
                  Monthly Visitors {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* New RadialBar Chart & Histogram Chart Container */}
          <div className="charts-container">
            <div className="charts">
              <div className="chart-container">
                <h3>
                  RadialBar Chart {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <div className="radial-chart-wrapper">
                  <Pie data={radialBarData} options={radialBarOptions} />
                </div>
              </div>
              <div className="chart-container">
                <h3>
                  Histogram Chart {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                {histogramData ? (
                  <Bar data={histogramData} options={histogramOptions} />
                ) : (
                  <p>Insufficient data for histogram</p>
                )}
              </div>
            </div>
          </div>
          
          {/* New Scatter Chart & Bubble Chart Container */}
          <div className="charts-container">
            <div className="charts">
              <div className="chart-container">
                <h3>
                  Scatter Chart {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <Scatter data={scatterData} options={scatterOptions} />
              </div>
              <div className="chart-container">
                <h3>
                  Bubble Chart {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <Bubble data={bubbleData} options={bubbleOptions} />
              </div>
            </div>
          </div>
  
          {modalVisible && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">
                    Today's Visitors {selectedBranch ? `- ${selectedBranchName}` : ''}
                  </h2>
                  <button className="close-button" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                  {loading ? (
                    <p>Loading...</p>
                  ) : todayVisitorsData?.length > 0 ? (
                    <table className="modal-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Company</th>
                          <th>Purpose</th>
                          <th>Reason</th>
                          <th>Department</th>
                          <th>Time In</th>
                          <th>Time Out</th>
                          <th>Telephone</th>
                          <th>Branch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayVisitorsData.map((visitor) => (
                          <tr key={visitor.id || visitor.telephone}>
                            <td>{visitor.name}</td>
                            <td>{visitor.company}</td>
                            <td>{visitor.purpose}</td>
                            <td>{visitor.reason}</td>
                            <td>{visitor.department}</td>
                            <td>{visitor.timeIn || visitor.timein}</td>
                            <td>{visitor.timeOut || visitor.timeout}</td>
                            <td>{visitor.telephone}</td>
                            <td>{visitor.branchname || visitor.branch}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No visitors found for today.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )} 
        </>
      )}
    </div>
  );
};

export default Dashboard;


//errror
Uncaught runtime errors:
×
ERROR
Cannot read properties of undefined (reading 'callback')
TypeError: Cannot read properties of undefined (reading 'callback')
    at http://localhost:3001/static/js/bundle.js:149467:108
    at Array.map (<anonymous>)
    at RadialLinearScale.generateTickLabels (http://localhost:3001/static/js/bundle.js:149466:42)
    at RadialLinearScale._convertTicksToLabels (http://localhost:3001/static/js/bundle.js:142497:10)
    at RadialLinearScale.update (http://localhost:3001/static/js/bundle.js:142244:10)
    at http://localhost:3001/static/js/bundle.js:141499:11
    at each (http://localhost:3001/static/js/bundle.js:150451:12)
    at Object.update (http://localhost:3001/static/js/bundle.js:141496:66)
    at Chart._updateLayout (http://localhost:3001/static/js/bundle.js:144331:13)
    at Chart.update (http://localhost:3001/static/js/bundle.js:144253:10)
ERROR
Canvas is already in use. Chart with ID '3' must be destroyed before the canvas with ID '' can be reused.
    at new Chart (http://localhost:3001/static/js/bundle.js:143953:13)
    at renderChart (http://localhost:3001/static/js/bundle.js:162138:24)
    at http://localhost:3001/static/js/bundle.js:162185:5
    at commitHookEffectListMount (http://localhost:3001/static/js/bundle.js:92038:30)
    at invokePassiveEffectMountInDEV (http://localhost:3001/static/js/bundle.js:93727:17)
    at invokeEffectsInDev (http://localhost:3001/static/js/bundle.js:95624:15)
    at commitDoubleInvokeEffectsInDEV (http://localhost:3001/static/js/bundle.js:95607:11)
    at flushPassiveEffectsImpl (http://localhost:3001/static/js/bundle.js:95380:9)
    at flushPassiveEffects (http://localhost:3001/static/js/bundle.js:95319:18)
    at http://localhost:3001/static/js/bundle.js:95134:13
ERROR
Cannot read properties of undefined (reading 'callback')
TypeError: Cannot read properties of undefined (reading 'callback')
    at http://localhost:3001/static/js/bundle.js:149467:108
    at Array.map (<anonymous>)
    at RadialLinearScale.generateTickLabels (http://localhost:3001/static/js/bundle.js:149466:42)
    at RadialLinearScale._convertTicksToLabels (http://localhost:3001/static/js/bundle.js:142497:10)
    at RadialLinearScale.update (http://localhost:3001/static/js/bundle.js:142244:10)
    at http://localhost:3001/static/js/bundle.js:141499:11
    at each (http://localhost:3001/static/js/bundle.js:150451:12)
    at Object.update (http://localhost:3001/static/js/bundle.js:141496:66)
    at Chart._updateLayout (http://localhost:3001/static/js/bundle.js:144331:13)
    at Chart.update (http://localhost:3001/static/js/bundle.js:144253:10)