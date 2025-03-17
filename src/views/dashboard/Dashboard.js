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
  const [activeLocation, setActiveLocation] = useState('Living Room')
  const [timeRange, setTimeRange] = useState('Day')
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Store real-time sensor data
  const [sensorData, setSensorData] = useState({
    'Living Room': { temperature: 0, decibel: 0, humidity: 0, battery: 90, lastUpdated: null },
    'Kitchen': { temperature: 0, decibel: 0, humidity: 0, battery: 85, lastUpdated: null },
    'Bedroom': { temperature: 0, decibel: 0, humidity: 0, battery: 95, lastUpdated: null },
    'Garage': { temperature: 0, decibel: 0, humidity: 0, battery: 80, lastUpdated: null },
  })

  // Store historical data (in a real app, this might come from the API)
  const [historicalData, setHistoricalData] = useState({
    'Living Room': {
      temperature: { Day: [], Month: [], Year: [] },
      decibel: { Day: [], Month: [], Year: [] },
    },
    'Kitchen': {
      temperature: { Day: [], Month: [], Year: [] },
      decibel: { Day: [], Month: [], Year: [] },
    },
    'Bedroom': {
      temperature: { Day: [], Month: [], Year: [] },
      decibel: { Day: [], Month: [], Year: [] },
    },
    'Garage': {
      temperature: { Day: [], Month: [], Year: [] },
      decibel: { Day: [], Month: [], Year: [] },
    },
  })
  
  // Map locations to sensor IDs
  const locationToSensorId = {
    'Living Room': 1,
    'Kitchen': 2,
    'Bedroom': 3,
    'Garage': 4
  }

  // Simulated historical data (normally you'd get this from an API)
  const populateHistoricalData = () => {
    const locations = ['Living Room', 'Kitchen', 'Bedroom', 'Garage'];
    const timeRanges = ['Hour', 'Day', 'Month', 'Year']; // Added 'Hour'
    const types = ['temperature', 'decibel'];
    
    const newHistoricalData = { ...historicalData };
    
    // Generate data for each location, time range, and sensor type
    locations.forEach(location => {
      types.forEach(type => {
        timeRanges.forEach(range => {
          const dataLength = range === 'Hour' ? 60 : range === 'Day' ? 24 : range === 'Month' ? 30 : 12;
          const baseValue = type === 'temperature' ? 
                             (location === 'Living Room' ? 24 : 
                             location === 'Kitchen' ? 26 : 
                             location === 'Bedroom' ? 22 : 20) : 
                             (location === 'Living Room' ? 50 : 
                             location === 'Kitchen' ? 60 : 
                             location === 'Bedroom' ? 35 : 45);
          
          newHistoricalData[location][type][range] = Array.from({ length: dataLength }, () => 
            baseValue + Math.floor(Math.random() * 10) - 5
          );
        });
      });
    });
    
    setHistoricalData(newHistoricalData);
  };

  // Fetch data from all sensors
  const fetchSensorData = async () => {
    setLoading(true);
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
          // Convert sound value from voltage to dB
          const voltageValue = response.data.soundValue;
          const referenceVoltage = 1.0; // Adjust based on your sensor calibration
          const decibelValue = Math.abs(voltageValue) < 0.001 ? 0 : 
                               20 * Math.log10(Math.abs(voltageValue) / referenceVoltage);
          
          newSensorData[location] = {
            temperature: response.data.temperatureValue,
            decibel: decibelValue, // Use converted value
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

  useEffect(() => {
    // Initial data fetch
    fetchSensorData();
    
    // Generate simulated historical data (in a real app, you'd fetch this from an API)
    populateHistoricalData();
    
    // Set up interval for regular updates (every 30 seconds)
    const interval = setInterval(fetchSensorData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update historical data when new sensor readings come in
    Object.entries(sensorData).forEach(([location, data]) => {
      if (data.lastUpdated) {
        const newHistoricalData = { ...historicalData };
        
        // Add latest readings to historical data arrays
        if (!newHistoricalData[location].temperature.Day.includes(data.temperature)) {
          newHistoricalData[location].temperature.Day.push(data.temperature);
          // Keep only last 24 readings
          if (newHistoricalData[location].temperature.Day.length > 24) {
            newHistoricalData[location].temperature.Day.shift();
          }
        }
        
        if (!newHistoricalData[location].decibel.Day.includes(data.decibel)) {
          newHistoricalData[location].decibel.Day.push(data.decibel);
          // Keep only last 24 readings
          if (newHistoricalData[location].decibel.Day.length > 24) {
            newHistoricalData[location].decibel.Day.shift();
          }
        }
        
        setHistoricalData(newHistoricalData);
      }
    });
  }, [sensorData]);

  // Example alert data - normally would be derived from sensor readings
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
              <CButton color="primary" className="float-end">
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
            historicalData={historicalData[activeLocation]}
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
                        <td>Arduino Nano IoT Sensor v2.1</td>
                      </tr>
                      <tr>
                        <td><strong>Firmware:</strong></td>
                        <td>v1.2.5</td>
                      </tr>
                      <tr>
                        <td><strong>Last Update:</strong></td>
                        <td>March 17, 2025</td>
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
                    <select defaultValue="60">
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