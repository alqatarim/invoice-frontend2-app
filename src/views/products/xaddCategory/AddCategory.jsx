'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import { addCategory } from '@/app/(dashboard)/products/actions';
import { toast } from 'react-toastify';
import { Upload as UploadIcon } from '@mui/icons-material';
import AddCategorySchema from '@/views/products/addCategory/AddCategorySchema'

const AddCategory = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(AddCategorySchema)
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size should not exceed 50MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('type', 'product');

      const response = await addCategory(formData);
      if (response.success) {
        toast.success('Category added successfully');
        router.push('/products/category-list');
      } else {
        toast.error(response.message || 'Failed to add category');
      }
    } catch (error) {
      toast.error(error.message || 'Error adding category');
    }
  };

  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h4" color="secondary">
        Add Category
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Slug"
                  {...register('slug')}
                  error={!!errors.slug}
                  helperText={errors.slug?.message}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box className="border-2 border-dashed rounded-md p-4">
                  <input
                    accept="image/*"
                    type="file"
                    id="image-upload"
                    hidden
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                      <IconButton component="span">
                        <UploadIcon />
                      </IconButton>
                      <Typography>
                        Drop your files here or <span style={{ color: 'primary.main' }}>browse</span>
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Maximum size: 50MB
                      </Typography>
                    </Box>
                  </label>
                  {imagePreview && (
                    <Box mt={2} display="flex" justifyContent="center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button
                component={Link}
                href="/products/category-list"
                variant="outlined"
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Add Category
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddCategory;
