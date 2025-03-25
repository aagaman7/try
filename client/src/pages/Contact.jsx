import React from 'react';
import ContactForm from '../components/contact/ContactForm';
import { Container, Grid, Typography, Box, Paper } from '@mui/material';

const Contact = () => {
  const locations = [
    {
      id: 1,
      name: 'Main Facility',
      address: '123 Fitness Street, Cityville, State 12345',
      phone: '(555) 123-4567',
      email: 'main@fitgym.com',
      hours: 'Monday-Friday: 5am-10pm, Weekends: 7am-8pm',
      mapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.6754691376977!2d85.35439737546808!3d27.727304676171023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1b003f9d0a6f%3A0x16ed7c38c35db998!2sRBL%20Fitness%20Club!5e0!3m2!1sen!2snp!4v1741512187554!5m2!1sen!2snp'
    },
    {
      id: 2,
      name: 'Downtown Branch',
      address: '456 Health Avenue, Downtown, State 12345',
      phone: '(555) 987-6543',
      email: 'downtown@fitgym.com',
      hours: 'Monday-Friday: 6am-9pm, Weekends: 8am-6pm',
      mapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.875859167983!2d85.35439741523194!3d27.72730468277806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1b003f9d0a6f%3A0x16ed7c38c35db998!2sRBL%20Fitness%20Club!5e0!3m2!1sen!2snp!4v1710000000000'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Contact Us
      </Typography>
      
      <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
        We're here to help! Reach out with any questions about memberships, classes, or facilities.
      </Typography>
      
      <Grid container spacing={4}>
        {/* Left side - Contact information and form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Send Us a Message
            </Typography>
            
            <Typography variant="body1" paragraph>
              Fill out the form below and our team will get back to you within 24 hours.
            </Typography>
            
            <ContactForm />
          </Paper>
        </Grid>
        
        {/* Right side - Location information and map */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Our Locations
            </Typography>
            
            {locations.map((location) => (
              <Box key={location.id} sx={{ mb: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {location.name}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Address:</strong> {location.address}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Phone:</strong> {location.phone}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Email:</strong> {location.email}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Hours:</strong> {location.hours}
                </Typography>
              </Box>
            ))}
            
            <Box sx={{ mt: 3, height: 300 }}>
              <iframe
                title="Gym Location Map"
                src={locations[0].mapLink}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
