import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CBadge,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

const WidgetsDropdown = ({ className, location = 'Esports' }) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  
  // Simulated data - replace with API call to your Arduino sensors
  const [sensorData, setSensorData] = useState({
    'Esports': {
      temperature: { current: 27, trend: 0.9, historical: [22, 24, 25, 26, 27, 27, 27] },
      decibel: { current: 45, trend: -12.4, historical: [65, 59, 52, 48, 47, 46, 45] },
      humidity: { current: 42.5, trend: 4.7, historical: [38, 39, 40, 41, 42, 42, 42.5] },
      battery: { current: 87, trend: -3.6, historical: [100, 98, 96, 93, 91, 89, 87] }
    },
    'LabIA': {
      temperature: { current: 29, trend: 2.3, historical: [24, 25, 26, 27, 28, 28, 29] },
      decibel: { current: 58, trend: 15.6, historical: [42, 45, 48, 52, 54, 56, 58] },
      humidity: { current: 48.7, trend: 8.2, historical: [40, 42, 44, 45, 46, 47, 48.7] },
      battery: { current: 92, trend: -2.1, historical: [100, 98, 97, 95, 94, 93, 92] }
    },
    'J140': {
      temperature: { current: 24, trend: -1.2, historical: [26, 26, 25, 25, 24, 24, 24] },
      decibel: { current: 32, trend: -24.5, historical: [50, 45, 42, 40, 38, 35, 32] },
      humidity: { current: 38.2, trend: 2.8, historical: [35, 36, 36, 37, 37, 38, 38.2] },
      battery: { current: 84, trend: -4.2, historical: [100, 97, 94, 91, 88, 86, 84] }
    },
    'IDIT2': {
      temperature: { current: 22, trend: -3.5, historical: [26, 25, 24, 24, 23, 22, 22] },
      decibel: { current: 39, trend: -18.7, historical: [60, 55, 50, 48, 45, 42, 39] },
      humidity: { current: 52.1, trend: 9.4, historical: [45, 46, 47, 48, 49, 51, 52.1] },
      battery: { current: 76, trend: -5.8, historical: [100, 95, 90, 85, 82, 79, 76] }
    }
  });

  // Function to determine threshold status
  const getThresholdStatus = (type, value) => {
    if (type === 'temperature') {
      if (value > 30) return 'danger';
      if (value > 27) return 'warning';
      if (value < 18) return 'info';
      return 'success';
    } else if (type === 'decibel') {
      if (value > 70) return 'danger';
      if (value > 55) return 'warning';
      return 'success';
    } else if (type === 'humidity') {
      if (value > 60) return 'danger';
      if (value < 30) return 'warning';
      return 'success';
    } else if (type === 'battery') {
      if (value < 20) return 'danger';
      if (value < 40) return 'warning';
      return 'success';
    }
    return 'primary';
  };

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
    
    // Here you would fetch data from your API
    // Example: 
    // const fetchSensorData = async () => {
    //   try {
    //     const response = await fetch('/api/sensors');
    //     const data = await response.json();
    //     setSensorData(data);
    //   } catch (error) {
    //     console.error('Error fetching sensor data:', error);
    //   }
    // };
    // 
    // fetchSensorData();
    // const interval = setInterval(fetchSensorData, 60000); // Update every minute
    // return () => clearInterval(interval);
    
  }, [widgetChartRef1, widgetChartRef2]);

  // Get data for the selected location
  const locationData = sensorData[location] || sensorData['Esports'];

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color={getThresholdStatus('temperature', locationData.temperature.current)}
          value={
            <>
              {locationData.temperature.current}°C{' '}
              <span className="fs-6 fw-normal">
                ({locationData.temperature.trend > 0 ? '+' : ''}{locationData.temperature.trend}% <CIcon icon={locationData.temperature.trend > 0 ? cilArrowTop : cilArrowBottom} />)
              </span>
            </>
          }
          title="Temperature"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Set Alert Thresholds</CDropdownItem>
                <CDropdownItem>View Detailed History</CDropdownItem>
                <CDropdownItem>Calibrate Sensor</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [
                  {
                    label: 'Temperature',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: locationData.temperature.historical,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: Math.min(...locationData.temperature.historical) - 5,
                    max: Math.max(...locationData.temperature.historical) + 5,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                    tension: 0.4,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color={getThresholdStatus('decibel', locationData.decibel.current)}
          value={
            <>
              {locationData.decibel.current} dB{' '}
              <span className="fs-6 fw-normal">
                ({locationData.decibel.trend > 0 ? '+' : ''}{locationData.decibel.trend}% <CIcon icon={locationData.decibel.trend > 0 ? cilArrowTop : cilArrowBottom} />)
              </span>
            </>
          }
          title="Noise Level"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Set Alert Thresholds</CDropdownItem>
                <CDropdownItem>View Detailed History</CDropdownItem>
                <CDropdownItem>Calibrate Sensor</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [
                  {
                    label: 'Decibels',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: locationData.decibel.historical,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: Math.min(...locationData.decibel.historical) - 5,
                    max: Math.max(...locationData.decibel.historical) + 5,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color={getThresholdStatus('humidity', locationData.humidity.current)}
          value={
            <>
              {locationData.humidity.current}%{' '}
              <span className="fs-6 fw-normal">
                ({locationData.humidity.trend > 0 ? '+' : ''}{locationData.humidity.trend}% <CIcon icon={locationData.humidity.trend > 0 ? cilArrowTop : cilArrowBottom} />)
              </span>
            </>
          }
          title="Humidity"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Set Alert Thresholds</CDropdownItem>
                <CDropdownItem>View Detailed History</CDropdownItem>
                <CDropdownItem>Calibrate Sensor</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [
                  {
                    label: 'Humidity',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: locationData.humidity.historical,
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color={getThresholdStatus('battery', locationData.battery.current)}
          value={
            <>
              {locationData.battery.current}%{' '}
              <span className="fs-6 fw-normal">
                ({locationData.battery.trend}% <CIcon icon={cilArrowBottom} />)
              </span>
            </>
          }
          title="Battery Status"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Set Alert Thresholds</CDropdownItem>
                <CDropdownItem>View Detailed History</CDropdownItem>
                <CDropdownItem>Maintenance Schedule</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [
                  {
                    label: 'Battery',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: locationData.battery.historical,
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  location: PropTypes.string,
}

export default WidgetsDropdown