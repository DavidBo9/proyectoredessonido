import React from 'react'
import PropTypes from 'prop-types'
import {
  CNav,
  CNavItem,
  CNavLink,
  CBadge,
  CCard,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilHome, 
  cilRestaurant, 
  cilColorBorder,
  cilGarage 
} from '@coreui/icons'

const LocationSelector = ({ activeLocation, onLocationChange, sensorData }) => {
  // Determine sensor status based on actual data
  const getLocationStatus = (location) => {
    const data = sensorData?.[location];
    if (!data) return 'warning';
    
    // Check for critical conditions
    if (data.temperature > 30 || data.decibel > 70 || data.humidity > 60 || data.battery < 20) {
      return 'danger';
    }
    
    // Check for warning conditions
    if (data.temperature > 27 || data.temperature < 18 || data.decibel > 55 || data.humidity < 30 || data.battery < 40) {
      return 'warning';
    }
    
    return 'success';
  }

  const getStatusText = (status) => {
    if (status === 'danger') return 'Alert';
    if (status === 'warning') return 'Warning';
    return 'OK';
  }

  const locations = [
    { name: 'Living Room', icon: cilHome },
    { name: 'Kitchen', icon: cilRestaurant },
    { name: 'Bedroom', icon: cilColorBorder },
    { name: 'Garage', icon: cilGarage },
  ]

  return (
    <CCard className="mb-4">
      <CCardBody className="p-0">
        <CNav variant="tabs" className="m-0">
          {locations.map((location) => {
            const status = getLocationStatus(location.name);
            return (
              <CNavItem key={location.name}>
                <CNavLink
                  active={activeLocation === location.name}
                  onClick={() => onLocationChange(location.name)}
                  className="d-flex align-items-center cursor-pointer"
                >
                  <CIcon icon={location.icon} className="me-2" />
                  {location.name}
                  <CBadge 
                    color={status} 
                    shape="rounded-pill" 
                    className="ms-2"
                  >
                    {getStatusText(status)}
                  </CBadge>
                </CNavLink>
              </CNavItem>
            );
          })}
        </CNav>
      </CCardBody>
    </CCard>
  )
}

LocationSelector.propTypes = {
  activeLocation: PropTypes.string.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  sensorData: PropTypes.object,
}

export default LocationSelector