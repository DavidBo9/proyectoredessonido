import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

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
  CTabs,
  CBadge,
  CAlert,
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
  
  // Simulated sensor health data - this would come from your API
  const sensorHealth = {
    'Esports': { status: 'success', lastSeen: '2 minutes ago', batteryLevel: 87, connectivity: 'Good' },
    'LabIA': { status: 'warning', lastSeen: '15 minutes ago', batteryLevel: 62, connectivity: 'Fair' },
    'J140': { status: 'success', lastSeen: '5 minutes ago', batteryLevel: 92, connectivity: 'Excellent' },
    'IDIT2': { status: 'danger', lastSeen: '2 hours ago', batteryLevel: 23, connectivity: 'Poor' },
  }

  // Example alert data - would be determined by your monitoring logic
  const [alerts, setAlerts] = useState([
    { location: 'LabIA', type: 'temperature', message: 'Temperature exceeds threshold (29°C)', time: '15 minutes ago', severity: 'warning' },
    { location: 'IDIT2', type: 'connectivity', message: 'Sensor offline', time: '2 hours ago', severity: 'danger' },
    { location: 'Esports', type: 'noise', message: 'Noise spike detected (78dB)', time: '1 hour ago', severity: 'warning' },
  ])
  
  // Filter alerts relevant to current location
  const locationAlerts = alerts.filter(alert => alert.location === activeLocation)

  // Progress example data for the selected location
  const getProgressData = (location) => {
    const data = {
      'Esports': [
        { title: 'Temperature Range', value: '20-27°C', percent: 65, color: 'success' },
        { title: 'Noise Average', value: '45dB', percent: 38, color: 'success' },
        { title: 'Humidity', value: '42%', percent: 42, color: 'info' },
        { title: 'Sensor Uptime', value: '99.7%', percent: 99.7, color: 'primary' },
        { title: 'Alert Count (24h)', value: '1 alert', percent: 10, color: 'warning' },
      ],
      'LabIA': [
        { title: 'Temperature Range', value: '24-29°C', percent: 82, color: 'warning' },
        { title: 'Noise Average', value: '58dB', percent: 65, color: 'warning' },
        { title: 'Humidity', value: '48%', percent: 48, color: 'info' },
        { title: 'Sensor Uptime', value: '96.3%', percent: 96.3, color: 'info' },
        { title: 'Alert Count (24h)', value: '2 alerts', percent: 20, color: 'warning' },
      ],
      'J140': [
        { title: 'Temperature Range', value: '19-24°C', percent: 45, color: 'success' },
        { title: 'Noise Average', value: '32dB', percent: 25, color: 'success' },
        { title: 'Humidity', value: '38%', percent: 38, color: 'info' },
        { title: 'Sensor Uptime', value: '99.8%', percent: 99.8, color: 'primary' },
        { title: 'Alert Count (24h)', value: '0 alerts', percent: 0, color: 'success' },
      ],
      'IDIT2': [
        { title: 'Temperature Range', value: '17-22°C', percent: 35, color: 'info' },
        { title: 'Noise Average', value: '39dB', percent: 30, color: 'success' },
        { title: 'Humidity', value: '52%', percent: 52, color: 'warning' },
        { title: 'Sensor Uptime', value: '78.2%', percent: 78.2, color: 'danger' },
        { title: 'Alert Count (24h)', value: '3 alerts', percent: 30, color: 'danger' },
      ],
    }
    return data[location] || data['Esports']
  }

  // Fetch sensor data - would be replaced with actual API calls
  useEffect(() => {
    // Example of how you might fetch sensor data:
    // const fetchSensorData = async () => {
    //   try {
    //     const response = await fetch(`/api/sensors/${activeLocation}`);
    //     const data = await response.json();
    //     // Update state with fetched data
    //   } catch (error) {
    //     console.error('Error fetching sensor data:', error);
    //   }
    // };
    //
    // fetchSensorData();
    // 
    // Real-time updates would use WebSockets or polling:
    // const interval = setInterval(fetchSensorData, 60000);
    // return () => clearInterval(interval);
  }, [activeLocation]);

  return (
    <>
      <LocationSelector 
        activeLocation={activeLocation}
        onLocationChange={setActiveLocation}
      />
      
      <WidgetsDropdown className="mb-4" location={activeLocation} />
      
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
          
          <MainChart location={activeLocation} timeRange={timeRange} />
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
                          <CBadge color={sensorHealth[activeLocation].status}>
                            {sensorHealth[activeLocation].status === 'success' ? 'Online' : 
                             sensorHealth[activeLocation].status === 'warning' ? 'Limited' : 'Offline'}
                          </CBadge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Last Reading:</strong></td>
                        <td>{sensorHealth[activeLocation].lastSeen}</td>
                      </tr>
                      <tr>
                        <td><strong>Battery:</strong></td>
                        <td>
                          {sensorHealth[activeLocation].batteryLevel}%
                          <CProgress thin className="mt-2" color={
                            sensorHealth[activeLocation].batteryLevel > 70 ? 'success' : 
                            sensorHealth[activeLocation].batteryLevel > 30 ? 'warning' : 'danger'
                          } value={sensorHealth[activeLocation].batteryLevel} />
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Connectivity:</strong></td>
                        <td>{sensorHealth[activeLocation].connectivity}</td>
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
                        <td>SN-{activeLocation.substring(0, 3).toUpperCase()}-1234</td>
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
                        <td>March 10, 2025</td>
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
                    <select className="form-select">
                      <option value="30">Every 30 seconds</option>
                      <option value="60" selected>Every minute</option>
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