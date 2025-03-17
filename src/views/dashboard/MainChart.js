import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const MainChart = ({ location = 'Esports', timeRange = 'Day' }) => {
  const chartRef = useRef(null)

  // This would be fetched from your API
  const sensorData = {
    'Esports': {
      temperature: {
        Day: [22, 22, 23, 24, 25, 26, 27, 27, 26, 26, 25, 24, 23, 23, 22, 22, 21, 21, 22, 23, 24, 25, 26, 27],
        Month: [21, 22, 23, 24, 25, 26, 27, 26, 25, 24, 23, 22, 21, 22, 23, 24, 25, 26, 27, 26, 25, 24, 23, 22, 23, 24, 25, 26, 27, 28],
        Year: [18, 19, 20, 22, 24, 26, 28, 27, 25, 23, 20, 19]
      },
      decibel: {
        Day: [45, 44, 43, 44, 50, 55, 60, 65, 70, 68, 65, 60, 55, 50, 48, 47, 46, 45, 44, 45, 50, 52, 48, 45],
        Month: [45, 48, 52, 55, 58, 55, 52, 50, 48, 46, 45, 47, 50, 52, 55, 52, 50, 48, 46, 45, 48, 52, 55, 52, 50, 48, 46, 45, 46, 45],
        Year: [40, 42, 45, 50, 55, 60, 65, 62, 58, 52, 48, 45]
      }
    },
    'LabIA': {
      temperature: {
        Day: [24, 24, 25, 26, 27, 28, 29, 29, 28, 28, 27, 26, 25, 25, 24, 24, 24, 24, 25, 26, 27, 28, 29, 29],
        Month: [23, 24, 25, 26, 27, 28, 29, 28, 27, 26, 25, 24, 23, 24, 25, 26, 27, 28, 29, 28, 27, 26, 25, 24, 25, 26, 27, 28, 29, 30],
        Year: [20, 21, 22, 24, 26, 28, 30, 29, 27, 25, 23, 21]
      },
      decibel: {
        Day: [50, 49, 48, 49, 52, 58, 62, 65, 68, 70, 68, 65, 60, 55, 52, 50, 49, 48, 49, 52, 55, 58, 52, 50],
        Month: [50, 52, 55, 58, 60, 58, 55, 52, 50, 48, 50, 52, 55, 58, 55, 52, 50, 48, 50, 52, 55, 58, 55, 52, 50, 52, 55, 52, 50, 48],
        Year: [45, 48, 52, 58, 62, 65, 68, 65, 62, 58, 52, 50]
      }
    },
    'J140': {
      temperature: {
        Day: [20, 20, 21, 22, 23, 24, 24, 24, 23, 23, 22, 21, 20, 20, 19, 19, 19, 20, 21, 22, 23, 23, 24, 24],
        Month: [19, 20, 21, 22, 23, 24, 25, 24, 23, 22, 21, 20, 19, 20, 21, 22, 23, 24, 24, 23, 22, 21, 20, 19, 20, 21, 22, 23, 24, 25],
        Year: [16, 17, 18, 20, 22, 24, 26, 25, 23, 21, 19, 17]
      },
      decibel: {
        Day: [30, 29, 28, 29, 32, 35, 38, 40, 42, 40, 38, 35, 32, 30, 29, 28, 28, 28, 30, 32, 34, 32, 30, 28],
        Month: [30, 32, 35, 38, 40, 38, 35, 32, 30, 28, 30, 32, 35, 38, 35, 32, 30, 28, 30, 32, 35, 38, 35, 32, 30, 28, 30, 32, 30, 28],
        Year: [25, 28, 32, 35, 38, 40, 42, 40, 38, 35, 32, 30]
      }
    },
    'IDIT2': {
      temperature: {
        Day: [18, 18, 19, 20, 21, 22, 22, 22, 21, 21, 20, 19, 18, 18, 17, 17, 17, 18, 19, 20, 21, 21, 22, 22],
        Month: [17, 18, 19, 20, 21, 22, 23, 22, 21, 20, 19, 18, 17, 18, 19, 20, 21, 22, 22, 21, 20, 19, 18, 17, 18, 19, 20, 21, 22, 23],
        Year: [14, 15, 16, 18, 20, 22, 24, 23, 21, 19, 17, 15]
      },
      decibel: {
        Day: [35, 34, 33, 34, 38, 42, 45, 48, 50, 48, 45, 42, 40, 38, 36, 35, 34, 33, 35, 38, 40, 38, 35, 33],
        Month: [35, 38, 42, 45, 48, 45, 42, 38, 35, 33, 35, 38, 42, 45, 42, 38, 35, 33, 35, 38, 42, 45, 42, 38, 35, 33, 35, 38, 35, 33],
        Year: [30, 33, 38, 42, 45, 48, 50, 48, 45, 42, 38, 35]
      }
    }
  };

  // Generate time labels based on the selected range
  const getTimeLabels = (range) => {
    if (range === 'Day') {
      return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    } else if (range === 'Month') {
      return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    } else if (range === 'Year') {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else if (range === 'Hour') {
      return Array.from({ length: 60 }, (_, i) => `${i} min`);
    }
    return [];
  };

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  // Get data for selected location and time range
  const locationData = sensorData[location] || sensorData['Esports'];
  const temperatureData = locationData.temperature[timeRange];
  const decibelData = locationData.decibel[timeRange];
  const timeLabels = getTimeLabels(timeRange);

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h5 className="mb-0">{location} Sensor Data</h5>
          <small className="text-body-secondary">Historical readings for temperature and noise level</small>
        </div>
      </div>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: timeLabels,
          datasets: [
            {
              label: 'Temperature (°C)',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: temperatureData,
              fill: true,
              yAxisID: 'y',
            },
            {
              label: 'Noise Level (dB)',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-success'),
              pointHoverBackgroundColor: getStyle('--cui-success'),
              borderWidth: 2,
              data: decibelData,
              yAxisID: 'y1',
            },
            {
              label: 'Safe Noise Threshold',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-danger'),
              pointHoverBackgroundColor: getStyle('--cui-danger'),
              borderWidth: 1,
              borderDash: [8, 5],
              data: Array(timeLabels.length).fill(70),
              yAxisID: 'y1',
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y;
                    if (context.dataset.label.includes('Temperature')) {
                      label += '°C';
                    } else if (context.dataset.label.includes('Noise') || context.dataset.label.includes('Threshold')) {
                      label += ' dB';
                    }
                  }
                  return label;
                }
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 20,
                color: getStyle('--cui-body-color'),
              }
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              beginAtZero: false,
              suggestedMin: Math.min(...temperatureData) - 5,
              suggestedMax: Math.max(...temperatureData) + 5,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
                callback: function(value) {
                  return value + '°C';
                }
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              beginAtZero: false,
              suggestedMin: 0,
              suggestedMax: Math.max(...decibelData) + 10,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
                callback: function(value) {
                  return value + ' dB';
                }
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

MainChart.propTypes = {
  location: PropTypes.string,
  timeRange: PropTypes.string,
}

export default MainChart