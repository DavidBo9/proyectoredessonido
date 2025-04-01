import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import axios from 'axios'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CBadge,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilNotes,
  cilBell,
  cilChartLine,
  cilSpeedometer,
  cilHistory,
  cilSettings,
} from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import LocationSelector from './LocationSelector'

const Dashboard = () => {
  const [activeLocation, setActiveLocation] = useState('Esports')
  const [timeRange, setTimeRange] = useState('Day')
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Store real-time sensor data
  const [sensorData, setSensorData] = useState({
    'Esports': { temperature: 0, decibel: 0, humidity: 0, battery: 90, lastUpdated: null },
    'Lab de Mecatronica': { temperature: 0, decibel: 0, humidity: 0, battery: 85, lastUpdated: null },
    'Lab de IA': { temperature: 0, decibel: 0, humidity: 0, battery: 95, lastUpdated: null },
    'Innovation Lab': { temperature: 0, decibel: 0, humidity: 0, battery: 80, lastUpdated: null },
  })

  // Store historical data
  const [historicalData, setHistoricalData] = useState({
    'Esports': {
      temperature: { Hour: [], Day: [], Month: [], Year: [] },
      decibel: { Hour: [], Day: [], Month: [], Year: [] }
    },
    'Lab de Mecatronica': {
      temperature: { Hour: [], Day: [], Month: [], Year: [] },
      decibel: { Hour: [], Day: [], Month: [], Year: [] }
    },
    'Lab de IA': {
      temperature: { Hour: [], Day: [], Month: [], Year: [] },
      decibel: { Hour: [], Day: [], Month: [], Year: [] }
    },
    'Innovation Lab': {
      temperature: { Hour: [], Day: [], Month: [], Year: [] },
      decibel: { Hour: [], Day: [], Month: [], Year: [] }
    }
  });
  
  // Map locations to sensor IDs
  const locationToSensorId = {
    'Esports': 1,
    'Lab de Mecatronica': 2,
    'Lab de IA': 3,
    'Innovation Lab': 4
  }

  // Fetch current data from all sensors
  const fetchSensorData = async () => {
    try {
      const responses = await Promise.all([
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/1'),
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/2'),
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/3'),
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/4')
      ]);
      
      const newSensorData = { ...sensorData };
      
      // Process responses
      responses.forEach((response, index) => {
        const sensorId = index + 1;
        const location = Object.keys(locationToSensorId).find(
          key => locationToSensorId[key] === sensorId
        );
        
        if (location && response.data) {
          newSensorData[location] = {
            temperature: response.data.temperatureValue,
            decibel: response.data.soundValue, // Use value directly without conversion
            humidity: response.data.humidityValue,
            battery: newSensorData[location].battery,
            lastUpdated: response.data.date
          };
        }
      });
      
      setSensorData(newSensorData);
      setError(null);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError("Failed to fetch sensor data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data for all sensors
  const fetchHistoricalData = async () => {
    try {
      const responses = await Promise.all([
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/history/1'),
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/history/2'),
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/history/3'),
        axios.get('https://lab-redes-orm.vercel.app/api/sensordata/history/4')
      ]);
      
      const newHistoricalData = { ...historicalData };
      
      // Process each sensor's history
      responses.forEach((response, index) => {
        const sensorId = index + 1;
        const location = Object.keys(locationToSensorId).find(
          key => locationToSensorId[key] === sensorId
        );
        
        if (location && response.data && response.data.length > 0) {
          // Sort data by timestamp (newest first)
          const sortedData = [...response.data].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          
          // Process for Hour view (last 60 readings)
          const hourData = sortedData.slice(0, 60);
          newHistoricalData[location].temperature.Hour = hourData.map(item => item.temperatureValue).reverse();
          newHistoricalData[location].decibel.Hour = hourData.map(item => item.soundValue).reverse();
          
          // Process for Day view (24 hours)
          const dayData = processDataByHour(sortedData);
          newHistoricalData[location].temperature.Day = dayData.temperature;
          newHistoricalData[location].decibel.Day = dayData.decibel;
          
          // Process for Month view (30 days)
          const monthData = processDataByDay(sortedData, 30);
          newHistoricalData[location].temperature.Month = monthData.temperature;
          newHistoricalData[location].decibel.Month = monthData.decibel;
          
          // Process for Year view (12 months)
          const yearData = processDataByMonth(sortedData);
          newHistoricalData[location].temperature.Year = yearData.temperature;
          newHistoricalData[location].decibel.Year = yearData.decibel;
        }
      });
      
      setHistoricalData(newHistoricalData);
    } catch (err) {
      console.error("Error fetching historical data:", err);
    }
  };

  // Helper function to process data by hour for Day view
  const processDataByHour = (data) => {
    const result = {
      temperature: Array(24).fill(null),
      decibel: Array(24).fill(null)
    };
    
    // Group by hour
    const hourlyData = {};
    data.forEach(reading => {
      const date = new Date(reading.date);
      const hour = date.getHours();
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      
      hourlyData[hour].push(reading);
    });
    
    // Calculate averages for each hour
    for (let hour = 0; hour < 24; hour++) {
      if (hourlyData[hour] && hourlyData[hour].length > 0) {
        // Average temperature
        const tempSum = hourlyData[hour].reduce((sum, item) => sum + item.temperatureValue, 0);
        result.temperature[hour] = tempSum / hourlyData[hour].length;
        
        // Average decibel - use direct values
        const decibelSum = hourlyData[hour].reduce((sum, item) => sum + item.soundValue, 0);
        result.decibel[hour] = decibelSum / hourlyData[hour].length;
      }
    }
    
    return result;
  };

  // Helper function to process data by day for Month view
  const processDataByDay = (data, days = 30) => {
    const result = {
      temperature: Array(days).fill(null),
      decibel: Array(days).fill(null)
    };
    
    // Group by day
    const dailyData = {};
    data.forEach(reading => {
      const date = new Date(reading.date);
      const day = date.getDate();
      
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      
      dailyData[day].push(reading);
    });
    
    // Calculate averages for each day
    for (let day = 1; day <= days; day++) {
      if (dailyData[day] && dailyData[day].length > 0) {
        // Average temperature
        const tempSum = dailyData[day].reduce((sum, item) => sum + item.temperatureValue, 0);
        result.temperature[day - 1] = tempSum / dailyData[day].length;
        
        // Average decibel - use direct values
        const decibelSum = dailyData[day].reduce((sum, item) => sum + item.soundValue, 0);
        result.decibel[day - 1] = decibelSum / dailyData[day].length;
      }
    }
    
    return result;
  };

  // Helper function to process data by month for Year view
  const processDataByMonth = (data) => {
    const result = {
      temperature: Array(12).fill(null),
      decibel: Array(12).fill(null)
    };
    
    // Group by month
    const monthlyData = {};
    data.forEach(reading => {
      const date = new Date(reading.date);
      const month = date.getMonth();
      
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      
      monthlyData[month].push(reading);
    });
    
    // Calculate averages for each month
    for (let month = 0; month < 12; month++) {
      if (monthlyData[month] && monthlyData[month].length > 0) {
        // Average temperature
        const tempSum = monthlyData[month].reduce((sum, item) => sum + item.temperatureValue, 0);
        result.temperature[month] = tempSum / monthlyData[month].length;
        
        // Average decibel - use direct values
        const decibelSum = monthlyData[month].reduce((sum, item) => sum + item.soundValue, 0);
        result.decibel[month] = decibelSum / monthlyData[month].length;
      }
    }
    
    return result;
  };

  useEffect(() => {
    // Initial data fetch
    fetchSensorData();
    fetchHistoricalData();
    
    // Set up intervals for regular updates
    const currentDataInterval = setInterval(fetchSensorData, 30000); // Every 30 seconds
    const historicalDataInterval = setInterval(fetchHistoricalData, 5 * 60000); // Every 5 minutes
    
    // Clean up intervals on component unmount
    return () => {
      clearInterval(currentDataInterval);
      clearInterval(historicalDataInterval);
    };
  }, []);

  // Example alert data - derived from sensor readings
  const [alerts, setAlerts] = useState([])
  
  // Update alerts based on sensor data
  useEffect(() => {
    const newAlerts = [];
    
    Object.entries(sensorData).forEach(([location, data]) => {
      if (data.temperature > 30) {
        newAlerts.push({
          location, 
          type: 'temperature',
          message: `Temperature exceeds threshold (${data.temperature.toFixed(1)}°C)`,
          time: 'Just now',
          severity: 'danger'
        });
      }
      
      if (data.decibel > 70) {
        newAlerts.push({
          location, 
          type: 'noise',
          message: `Noise level exceeds threshold (${data.decibel.toFixed(1)}dB)`,
          time: 'Just now',
          severity: 'danger'
        });
      }
      
      if (data.humidity < 30 || data.humidity > 60) {
        newAlerts.push({
          location, 
          type: 'humidity',
          message: `Humidity ${data.humidity < 30 ? 'below' : 'above'} recommended level (${data.humidity.toFixed(1)}%)`,
          time: 'Just now',
          severity: 'warning'
        });
      }
    });
    
    setAlerts(newAlerts);
  }, [sensorData]);
  
  // Filter alerts relevant to current location
  const locationAlerts = alerts.filter(alert => alert.location === activeLocation)

  // Progress example data based on actual sensor readings
  const getProgressData = (location) => {
    const data = sensorData[location] || { temperature: 0, decibel: 0, humidity: 0, battery: 0 };
    
    return [
      { 
        title: 'Temperature', 
        value: `${data.temperature.toFixed(1)}°C`, 
        percent: Math.min(100, (data.temperature / 40) * 100), 
        color: data.temperature > 30 ? 'danger' : data.temperature > 27 ? 'warning' : 'success' 
      },
      { 
        title: 'Noise Level', 
        value: `${data.decibel.toFixed(1)}dB`, 
        percent: Math.min(100, (data.decibel / 100) * 100), 
        color: data.decibel > 70 ? 'danger' : data.decibel > 55 ? 'warning' : 'success' 
      },
      { 
        title: 'Humidity', 
        value: `${data.humidity.toFixed(1)}%`, 
        percent: data.humidity, 
        color: data.humidity > 60 ? 'danger' : data.humidity < 30 ? 'warning' : 'info' 
      },
      { 
        title: 'Battery Status', 
        value: `${data.battery}%`, 
        percent: data.battery, 
        color: data.battery < 20 ? 'danger' : data.battery < 40 ? 'warning' : 'primary' 
      },
      { 
        title: 'Alerts', 
        value: `${locationAlerts.length} alert${locationAlerts.length !== 1 ? 's' : ''}`, 
        percent: Math.min(100, locationAlerts.length * 20), 
        color: locationAlerts.length > 2 ? 'danger' : locationAlerts.length > 0 ? 'warning' : 'success' 
      },
    ];
  };

  // Sensor health data derived from actual readings
  const getSensorHealth = (location) => {
    const data = sensorData[location];
    
    // Check if last update is within the last 5 minutes
    const lastUpdateTime = data.lastUpdated ? new Date(data.lastUpdated) : null;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const isOnline = lastUpdateTime && lastUpdateTime > fiveMinutesAgo;
    
    // Determine status based on readings and online status
    let status = isOnline ? 'success' : 'danger';
    if (isOnline && (data.temperature > 30 || data.decibel > 70)) {
      status = 'warning';
    }
    
    return {
      status,
      lastSeen: data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Not available',
      batteryLevel: 100, // Fixed at 100% since you're on computer power
      connectivity: isOnline ? 'Good' : 'Disconnected',
      isOnline: isOnline
    };
  };

  // Add this function to your Dashboard.js file
const exportData = () => {
  // Determine which data to export based on active location and time range
  const dataToExport = {
    location: activeLocation,
    timeRange: timeRange,
    currentReadings: sensorData[activeLocation],
    historicalData: {
      temperature: historicalData[activeLocation].temperature[timeRange],
      decibel: historicalData[activeLocation].decibel[timeRange]
    },
    exportDate: new Date().toISOString(),
    device: `SN-${locationToSensorId[activeLocation]}`
  };
  
  // Convert to CSV format
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  csvContent += "Timestamp,Temperature (°C),Noise Level (dB),Humidity (%)\n";
  
  // Add current reading
  csvContent += `${new Date().toISOString()},${dataToExport.currentReadings.temperature},${dataToExport.currentReadings.decibel},${dataToExport.currentReadings.humidity}\n`;
  
  // Add historical data if available
  if (dataToExport.historicalData.temperature.length > 0) {
    // Get appropriate time labels based on timeRange
    const timeLabels = getTimeLabels(timeRange);
    
    // Add historical rows
    for (let i = 0; i < dataToExport.historicalData.temperature.length; i++) {
      const temp = dataToExport.historicalData.temperature[i] || "";
      const db = dataToExport.historicalData.decibel[i] || "";
      const timestamp = timeLabels[i] || `Reading ${i+1}`;
      
      csvContent += `${timestamp},${temp},${db},\n`;
    }
  }
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sensor_data_${activeLocation}_${timeRange}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  
  // Trigger download and clean up
  link.click();
  document.body.removeChild(link);
};

// Helper function to get appropriate time labels
const getTimeLabels = (range) => {
  const now = new Date();
  
  if (range === 'Hour') {
    return Array.from({ length: 60 }, (_, i) => {
      const d = new Date(now);
      d.setMinutes(now.getMinutes() - (59 - i));
      return d.toISOString();
    });
  } else if (range === 'Day') {
    return Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now);
      d.setHours(now.getHours() - (23 - i));
      return d.toISOString();
    });
  } else if (range === 'Month') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d.toISOString();
    });
  } else if (range === 'Year') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - (11 - i));
      return d.toISOString();
    });
  }
  return [];
};

  return (
    <>
      <LocationSelector 
        activeLocation={activeLocation}
        onLocationChange={setActiveLocation}
        sensorData={sensorData}
      />
      
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <CSpinner color="primary" />
        </div>
      )}
      
      {error && (
        <CAlert color="danger" dismissible>
          {error}
        </CAlert>
      )}
      
      <WidgetsDropdown 
        className="mb-4" 
        location={activeLocation} 
        sensorData={sensorData[activeLocation]}
      />
      
      {/* Main chart and tabs */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="sensor-readings" className="card-title mb-0">
                Sensor Readings
              </h4>
              <div className="small text-body-secondary">Real-time and historical data</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
            <CButton color="primary" className="float-end" onClick={exportData}>
              <CIcon icon={cilCloudDownload} /> Export Data
            </CButton>
              <CButtonGroup className="float-end me-3">
                {['Hour', 'Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === timeRange}
                    onClick={() => setTimeRange(value)}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          
          <MainChart 
            location={activeLocation} 
            timeRange={timeRange} 
            currentData={sensorData[activeLocation]} 
            historicalData={historicalData}  // Pass the whole historicalData object
          />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {getProgressData(activeLocation).map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value}
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>

      {/* Sensor details card */}
      <CCard className="mb-4">
        <CCardHeader>
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
              >
                <CIcon icon={cilChartLine} className="me-2" />
                Dashboard
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 2}
                onClick={() => setActiveTab(2)}
              >
                <CIcon icon={cilBell} className="me-2" />
                Alerts
                {locationAlerts.length > 0 && (
                  <CBadge color="danger" shape="rounded-pill" className="ms-2">
                    {locationAlerts.length}
                  </CBadge>
                )}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 3}
                onClick={() => setActiveTab(3)}
              >
                <CIcon icon={cilHistory} className="me-2" />
                History
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 4}
                onClick={() => setActiveTab(4)}
              >
                <CIcon icon={cilSettings} className="me-2" />
                Settings
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        <CCardBody>
          <CTabContent>
            <CTabPane role="tabpanel" visible={activeTab === 1}>
              <CRow>
                <CCol md={6}>
                  <h4>Sensor Status</h4>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <CBadge color={getSensorHealth(activeLocation).status}>
                            {getSensorHealth(activeLocation).isOnline ? 'Online' : 'Offline'}
                          </CBadge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Last Reading:</strong></td>
                        <td>{getSensorHealth(activeLocation).lastSeen}</td>
                      </tr>
                      <tr>
                        <td><strong>Connectivity:</strong></td>
                        <td>{getSensorHealth(activeLocation).connectivity}</td>
                      </tr>
                    </tbody>
                  </table>
                </CCol>
                <CCol md={6}>
                  <h4>Sensor Information</h4>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Device ID:</strong></td>
                        <td>SN-{locationToSensorId[activeLocation]}</td>
                      </tr>
                      <tr>
                        <td><strong>Model:</strong></td>
                        <td>ESP32 IoT Sensor v2.1</td>
                      </tr>
                      <tr>
                        <td><strong>Firmware:</strong></td>
                        <td>v1.2.5</td>
                      </tr>
                      <tr>
                        <td><strong>Last Update:</strong></td>
                        <td>March 24, 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </CCol>
              </CRow>
            </CTabPane>
            
            <CTabPane role="tabpanel" visible={activeTab === 2}>
              <h4>Recent Alerts</h4>
              {locationAlerts.length === 0 ? (
                <CAlert color="success">
                  No alerts for {activeLocation} sensors.
                </CAlert>
              ) : (
                locationAlerts.map((alert, index) => (
                  <CAlert key={index} color={alert.severity}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{alert.location}</strong>: {alert.message}
                      </div>
                      <small>{alert.time}</small>
                    </div>
                  </CAlert>
                ))
              )}
            </CTabPane>
            
            <CTabPane role="tabpanel" visible={activeTab === 3}>
              <h4>Historical Data</h4>
              <p>View and download historical data for the {activeLocation} sensors.</p>
              <CRow className="mb-3">
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" />
                  </div>
                </CCol>
              </CRow>
              <div className="d-flex justify-content-end">
                <CButton color="primary">
                  <CIcon icon={cilCloudDownload} /> Download Data
                </CButton>
              </div>
            </CTabPane>
            
            <CTabPane role="tabpanel" visible={activeTab === 4}>
              <h4>Sensor Settings</h4>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label">Temperature Alert Threshold (°C)</label>
                    <div className="d-flex">
                      <div className="me-2">
                        <label className="form-label small">Low</label>
                        <input type="number" className="form-control" defaultValue="18" />
                      </div>
                      <div>
                        <label className="form-label small">High</label>
                        <input type="number" className="form-control" defaultValue="30" />
                      </div>
                    </div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label">Noise Alert Threshold (dB)</label>
                    <input type="number" className="form-control" defaultValue="70" />
                  </div>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label">Humidity Alert Threshold (%)</label>
                    <div className="d-flex">
                      <div className="me-2">
                        <label className="form-label small">Low</label>
                        <input type="number" className="form-control" defaultValue="30" />
                      </div>
                      <div>
                        <label className="form-label small">High</label>
                        <input type="number" className="form-control" defaultValue="60" />
                      </div>
                    </div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label">Reading Frequency</label>
                    <select className="form-select" defaultValue="60">
                      <option value="30">Every 30 seconds</option>
                      <option value="60">Every minute</option>
                      <option value="300">Every 5 minutes</option>
                      <option value="900">Every 15 minutes</option>
                    </select>
                  </div>
                </CCol>
              </CRow>
              <div className="d-flex justify-content-end">
                <CButton color="primary">Save Settings</CButton>
              </div>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard