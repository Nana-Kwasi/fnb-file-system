import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardCharts = () => {
  const monthlyFileData = [
    {
      month: 'Jan',
      PDF: 300,
      Excel: 200,
      Archive: 150,
      Word: 250,
    },
    {
      month: 'Feb',
      PDF: 280,
      Excel: 220,
      Archive: 180,
      Word: 270,
    },
    {
      month: 'Mar',
      PDF: 320,
      Excel: 240,
      Archive: 200,
      Word: 290,
    },
    {
      month: 'Apr',
      PDF: 340,
      Excel: 260,
      Archive: 220,
      Word: 310,
    }
  ];

  const pieChartData = [
    { name: 'PDF', value: 300, color: '#FF6B6B' },
    { name: 'Excel', value: 450, color: '#4ECDC4' },
    { name: 'Archive', value: 350, color: '#45B7D1' },
    { name: 'Word', value: 250, color: '#96CEB4' }
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart Container */}
      <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly File Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyFileData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="PDF" fill="#FF6B6B" />
            <Bar dataKey="Excel" fill="#4ECDC4" />
            <Bar dataKey="Archive" fill="#45B7D1" />
            <Bar dataKey="Word" fill="#96CEB4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart Container */}
      <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">File Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;