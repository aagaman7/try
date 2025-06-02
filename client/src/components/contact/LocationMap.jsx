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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <ToggleButtonGroup
        value={selectedLocation}
        exclusive
        onChange={handleLocationChange}
        aria-label="gym locations"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            flex: 1,
            py: 1.5,
            color: 'text.secondary',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          },
        }}
      >
        {locations.map((location) => (
          <ToggleButton
            key={location.id}
            value={location.id}
            aria-label={location.name}
          >
            {location.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body1" component="div">
            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Address:
            </Box>
            {currentLocation.address}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body1" component="div">
            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Hours:
            </Box>
            {currentLocation.hours}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body1" component="div">
            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Contact:
            </Box>
            <a 
              href={`tel:${currentLocation.phone}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {currentLocation.phone}
            </a>
            <br />
            <a 
              href={`mailto:${currentLocation.email}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {currentLocation.email}
            </a>
          </Typography>
        </Box>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          flexGrow: 1, 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          minHeight: '400px'
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
            title={`${currentLocation.name} Map`}
          ></iframe>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            bgcolor: 'grey.100'
          }}>
            <Typography color="text.secondary">Map view not available</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LocationMap;