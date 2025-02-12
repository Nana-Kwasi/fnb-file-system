// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { InvoiceProvider } from './Context/InvoiceContext';
import Login from './Login/Login';
import Dashboard from './Dashboard/FileDashboard';
import Statistics from './Statistics/Statistics';
import Reports from './Report/Report';
import Upload from './Upload/Upload';
import DashboardCharts from './Dashboardchart/Dashboardchart';
import FileStatusCircles from './File/FileStatus';
const App = () => {
  return (
    <AuthProvider>
      <InvoiceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Reports" element={<Reports />} />
            <Route path="/Statistics" element={<Statistics />} />
            <Route path="/Upload" element={<Upload />} />
            <Route path="/DashboardCharts" element={<DashboardCharts />} />
            <Route path="/FileStatus" element={<FileStatusCircles />} />

          </Routes>
        </Router>
      </InvoiceProvider>
    </AuthProvider>
  );
};

export default App;