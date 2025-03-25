import React, { useState } from 'react';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';

const LocationMap = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || null);

  const handleLocationChange = (event, newLocation) => {
    if (newLocation !== null) {
      setSelectedLocation(newLocation);
    }
  };

  const currentLocation = locations.find(loc => loc.id === selectedLocation) || locations[0];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ToggleButtonGroup
        value={selectedLocation}
        exclusive
        onChange={handleLocationChange}
        aria-label="gym locations"
        sx={{ mb: 2, display: 'flex', flexWrap: 'wrap' }}
      >
        {locations.map((location) => (
          <ToggleButton
            key={location.id}
            value={location.id}
            aria-label={location.name}
            sx={{ flexGrow: 1 }}
          >
            {location.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Paper 
        elevation={2} 
        sx={{ 
          flexGrow: 1, 
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#e5e5e5'
        }}
      >
        {currentLocation.mapLink ? (
          <iframe
            src={currentLocation.mapLink}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        ) : (
          <Typography>Map view not available</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default LocationMap;