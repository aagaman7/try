import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Snackbar, 
  Alert,
  Box,
  CircularProgress,
  Typography,
  styled
} from '@mui/material';
import apiService from '../../services/apiService';

// Styled components for custom theme
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f43f5e',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#f43f5e',
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.5)',
    '&.Mui-error': {
      color: '#f43f5e',
    },
  },
});

const StyledSelect = styled(Select)({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'white',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#f43f5e',
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

const StyledInputLabel = styled(InputLabel)({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-focused': {
    color: '#f43f5e',
  },
});

const ContactForm = () => {
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContactMethod: 'email',
    preferredLocation: 'kapan'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const subjectOptions = [
    'Membership Inquiry',
    'Personal Training',
    'Group Classes',
    'Facility Information',
    'Pricing & Packages',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+977|0)?[9][6-9]\d{8}$/i.test(formData.phone)) {
      newErrors.phone = 'Invalid Nepali phone number format (e.g., +977 98XXXXXXXX)';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        await apiService.submitContactMessage(formData);
        
        setSnackbar({
          open: true,
          message: 'Thank you for your message! Our team will get back to you within 24 hours.',
          severity: 'success'
        });
        
        setFormData(initialFormState);
      } catch (error) {
        console.error('Contact form submission error:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to send message. Please try again later.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
            All fields marked with * are required
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            required
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            required
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            required
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone || "Format: +977 98XXXXXXXX"}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <StyledInputLabel id="preferred-contact-label">Preferred Contact Method</StyledInputLabel>
            <StyledSelect
              labelId="preferred-contact-label"
              name="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={handleChange}
              disabled={loading}
              label="Preferred Contact Method"
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="viber">Viber</MenuItem>
            </StyledSelect>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <StyledInputLabel id="preferred-location-label">Preferred Location</StyledInputLabel>
            <StyledSelect
              labelId="preferred-location-label"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
              disabled={loading}
              label="Preferred Location"
            >
              <MenuItem value="kapan">Kapan Branch</MenuItem>
              <MenuItem value="chabahil">Chabahil Branch</MenuItem>
            </StyledSelect>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <StyledInputLabel id="subject-label">Subject *</StyledInputLabel>
            <StyledSelect
              labelId="subject-label"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={!!errors.subject}
              disabled={loading}
              required
              label="Subject"
            >
              {subjectOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            required
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            error={!!errors.message}
            helperText={errors.message}
            multiline
            rows={4}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ 
              mt: 2,
              py: 1.5,
              fontSize: '1rem',
              backgroundColor: '#f43f5e',
              color: 'white',
              '&:hover': {
                backgroundColor: '#e11d48',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(244, 63, 94, 0.3)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(244, 63, 94, 0.5)',
                color: 'rgba(255, 255, 255, 0.5)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                Sending...
              </>
            ) : 'Send Message'}
          </Button>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            backgroundColor: snackbar.severity === 'success' ? '#f43f5e' : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactForm;