// src/components/CreatorProfileForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const platformOptions = [
  'YouTube',
  'Instagram',
  'TikTok',
  'Twitter',
  'Facebook',
  'Twitch',
  'Patreon',
  'Other'
];

const categoryOptions = [
  'Entertainment',
  'Education',
  'Gaming',
  'Technology',
  'Fashion',
  'Beauty',
  'Fitness',
  'Food',
  'Travel',
  'Music',
  'Art',
  'Business',
  'Other'
];

function CreatorProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    channelName: '',
    platforms: [{ name: '', url: '', subscribers: '' }],
    totalSubscribers: '',
    viewsLast30Days: '',
    contentCategory: '',
    description: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      tiktok: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlatformChange = (index, field, value) => {
    const updatedPlatforms = [...formData.platforms];
    updatedPlatforms[index][field] = value;
    setFormData(prev => ({
      ...prev,
      platforms: updatedPlatforms
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const addPlatform = () => {
    setFormData(prev => ({
      ...prev,
      platforms: [...prev.platforms, { name: '', url: '', subscribers: '' }]
    }));
  };

  const removePlatform = (index) => {
    if (formData.platforms.length > 1) {
      const updatedPlatforms = [...formData.platforms];
      updatedPlatforms.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        platforms: updatedPlatforms
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.channelName.trim()) {
      newErrors.channelName = 'Channel name is required';
    }
    
    if (formData.platforms.some(p => !p.name)) {
      newErrors.platforms = 'Platform name is required for all platforms';
    }
    
    if (!formData.totalSubscribers || isNaN(formData.totalSubscribers)) {
      newErrors.totalSubscribers = 'Valid subscriber count is required';
    }
    
    if (!formData.viewsLast30Days || isNaN(formData.viewsLast30Days)) {
      newErrors.viewsLast30Days = 'Valid view count is required';
    }
    
    if (!formData.contentCategory) {
      newErrors.contentCategory = 'Content category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          channelName: formData.channelName,
          platforms: formData.platforms.map(p => ({
            name: p.name,
            url: p.url || undefined,
            subscribers: parseInt(p.subscribers)
          })),
          totalSubscribers: parseInt(formData.totalSubscribers),
          viewsLast30Days: parseInt(formData.viewsLast30Days),
          contentCategory: formData.contentCategory,
          description: formData.description,
          socialLinks: Object.fromEntries(
            Object.entries(formData.socialLinks)
              .filter(([_, value]) => value)
          )
        })
      });
      
      if (response.ok) {
        navigate('/creator');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile completion failed');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Complete Your Creator Profile
        </Typography>
        <Typography variant="body1" paragraph>
          Please fill out your creator details to start connecting with businesses.
        </Typography>
        
        {errors.submit && (
          <Typography color="error" paragraph>
            {errors.submit}
          </Typography>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Channel Name"
                name="channelName"
                value={formData.channelName}
                onChange={handleChange}
                error={!!errors.channelName}
                helperText={errors.channelName}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Your Platforms
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {formData.platforms.map((platform, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth>
                      <InputLabel>Platform *</InputLabel>
                      <Select
                        value={platform.name}
                        onChange={(e) => handlePlatformChange(index, 'name', e.target.value)}
                        label="Platform"
                        required
                      >
                        {platformOptions.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Channel URL"
                      value={platform.url}
                      onChange={(e) => handlePlatformChange(index, 'url', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={1}>
                    <TextField
                      fullWidth
                      label="Subscribers"
                      type="number"
                      value={platform.subscribers}
                      onChange={(e) => handlePlatformChange(index, 'subscribers', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => removePlatform(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              
              {errors.platforms && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.platforms}
                </Typography>
              )}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addPlatform}
                variant="outlined"
              >
                Add Platform
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Subscribers"
                name="totalSubscribers"
                type="number"
                value={formData.totalSubscribers}
                onChange={handleChange}
                error={!!errors.totalSubscribers}
                helperText={errors.totalSubscribers}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Views (Last 30 Days)"
                name="viewsLast30Days"
                type="number"
                value={formData.viewsLast30Days}
                onChange={handleChange}
                error={!!errors.viewsLast30Days}
                helperText={errors.viewsLast30Days}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Content Category *</InputLabel>
                <Select
                  name="contentCategory"
                  value={formData.contentCategory}
                  onChange={handleChange}
                  label="Content Category"
                  error={!!errors.contentCategory}
                  required
                >
                  {categoryOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
                {errors.contentCategory && (
                  <Typography color="error" variant="body2">
                    {errors.contentCategory}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.description.length}/500 characters`}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Social Links
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {Object.entries(formData.socialLinks).map(([platform, url]) => (
                  <Grid item xs={12} sm={6} key={platform}>
                    <TextField
                      fullWidth
                      label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      value={url}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      placeholder={`https://${platform}.com/username`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default CreatorProfileForm;