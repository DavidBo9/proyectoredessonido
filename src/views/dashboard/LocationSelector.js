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
  cilColorBorder, // Using this instead of cilHotel which isn't available
  cilGarage, 
  cilCode,
  cilGamepad
} from '@coreui/icons'

const LocationSelector = ({ activeLocation, onLocationChange }) => {
  // Sensor status for location badges
  const getLocationStatus = (location) => {
    // This would come from your actual sensor data
    const statusMap = {
      'Esports': 'success',
      'LabIA': 'warning',
      'J140': 'success',
      'IDIT2': 'danger',
    }
    return statusMap[location] || 'success'
  }

  const locations = [
    { name: 'Esports', icon: cilGamepad },
    { name: 'LabIA', icon: cilCode },
    { name: 'J140', icon: cilColorBorder }, // Changed from cilHotel to cilColorBorder
    { name: 'IDIT2', icon: cilGarage },
  ]

  return (
    <CCard className="mb-4">
      <CCardBody className="p-0">
        <CNav variant="tabs" className="m-0">
          {locations.map((location) => (
            <CNavItem key={location.name}>
              <CNavLink
                active={activeLocation === location.name}
                onClick={() => onLocationChange(location.name)}
                className="d-flex align-items-center cursor-pointer"
              >
                <CIcon icon={location.icon} className="me-2" />
                {location.name}
                <CBadge 
                  color={getLocationStatus(location.name)} 
                  shape="rounded-pill" 
                  className="ms-2"
                >
                  {getLocationStatus(location.name) === 'danger' ? 'Alert' : 'OK'}
                </CBadge>
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>
      </CCardBody>
    </CCard>
  )
}

LocationSelector.propTypes = {
  activeLocation: PropTypes.string.isRequired,
  onLocationChange: PropTypes.func.isRequired,
}

export default LocationSelector