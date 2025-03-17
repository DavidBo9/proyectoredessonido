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

const WidgetsDropdown = ({ className, location = 'Living Room', sensorData }) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  
  // Historical data for charts - in a real implementation, this would come from an API
  // Here we'll simulate it
  const [historicalData, setHistoricalData] = useState({
    temperature: [0, 0, 0, 0, 0, 0, 0],
    decibel: [0, 0, 0, 0, 0, 0, 0],
    humidity: [0, 0, 0, 0, 0, 0, 0],
    battery: [100, 95, 90, 85, 80, 75, 70]
  })

  // Update historical data with the current reading
  useEffect(() => {
    if (sensorData) {
      setHistoricalData(prev => {
        const newData = { ...prev }
        
        // Add current values to historical arrays
        if (sensorData.temperature) {
          newData.temperature = [...prev.temperature.slice(1), sensorData.temperature]
        }
        
        if (sensorData.decibel) {
          newData.decibel = [...prev.decibel.slice(1), sensorData.decibel]
        }
        
        if (sensorData.humidity) {
          newData.humidity = [...prev.humidity.slice(1), sensorData.humidity]
        }
        
        return newData
      })
    }
  }, [sensorData])

  // Function to determine threshold status
  const getThresholdStatus = (type, value) => {
    if (!value && value !== 0) return 'primary'
    
    if (type === 'temperature') {
      if (value > 30) return 'danger'
      if (value > 27) return 'warning'
      if (value < 18) return 'info'
      return 'success'
    } else if (type === 'decibel') {
      if (value > 70) return 'danger'
      if (value > 55) return 'warning'
      return 'success'
    } else if (type === 'humidity') {
      if (value > 60) return 'danger'
      if (value < 30) return 'warning'
      return 'success'
    } else if (type === 'battery') {
      if (value < 20) return 'danger'
      if (value < 40) return 'warning'
      return 'success'
    }
    return 'primary'
  }

  // Calculate trend (percentage change) from previous reading
  const calculateTrend = (currentValue, historicalValues) => {
    if (!historicalValues || historicalValues.length < 2) return 0
    
    const previousValue = historicalValues[historicalValues.length - 2]
    if (previousValue === 0) return 0
    
    return ((currentValue - previousValue) / previousValue) * 100
  }

  // Handle theme changes
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
  }, [widgetChartRef1, widgetChartRef2])

  // Default data if API data is not available yet
  const data = sensorData || {
    temperature: 0,
    decibel: 0,
    humidity: 0,
    battery: 90
  }

  // Calculate trends
  const temperatureTrend = calculateTrend(data.temperature, historicalData.temperature)
  const decibelTrend = calculateTrend(data.decibel, historicalData.decibel)
  const humidityTrend = calculateTrend(data.humidity, historicalData.humidity)
  const batteryTrend = -1 * Math.abs(calculateTrend(data.battery, historicalData.battery)) // Battery always decreases

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={3}>
        <CWidgetStatsA
          color={getThresholdStatus('temperature', data.temperature)}
          value={
            <>
              {data.temperature ? data.temperature.toFixed(1) : '0'}°C{' '}
              <span className="fs-6 fw-normal">
                ({temperatureTrend > 0 ? '+' : ''}{temperatureTrend.toFixed(1)}% <CIcon icon={temperatureTrend > 0 ? cilArrowTop : cilArrowBottom} />)
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
                    data: historicalData.temperature,
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
                    min: Math.min(...historicalData.temperature) - 5,
                    max: Math.max(...historicalData.temperature) + 5,
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
          color={getThresholdStatus('decibel', data.decibel)}
          value={
            <>
              {data.decibel ? data.decibel.toFixed(1) : '0'} dB{' '}
              <span className="fs-6 fw-normal">
                ({decibelTrend > 0 ? '+' : ''}{decibelTrend.toFixed(1)}% <CIcon icon={decibelTrend > 0 ? cilArrowTop : cilArrowBottom} />)
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
                    data: historicalData.decibel,
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
                    min: Math.min(...historicalData.decibel) - 5,
                    max: Math.max(...historicalData.decibel) + 5,
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
          color={getThresholdStatus('humidity', data.humidity)}
          value={
            <>
              {data.humidity ? data.humidity.toFixed(1) : '0'}%{' '}
              <span className="fs-6 fw-normal">
                ({humidityTrend > 0 ? '+' : ''}{humidityTrend.toFixed(1)}% <CIcon icon={humidityTrend > 0 ? cilArrowTop : cilArrowBottom} />)
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
                    data: historicalData.humidity,
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
          color={getThresholdStatus('battery', data.battery)}
          value={
            <>
              {data.battery ? data.battery : '0'}%{' '}
              <span className="fs-6 fw-normal">
                ({batteryTrend.toFixed(1)}% <CIcon icon={cilArrowBottom} />)
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
                    data: historicalData.battery,
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
  sensorData: PropTypes.object,
}

export default WidgetsDropdown