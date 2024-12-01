'use client';

import React, { useEffect, useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import Link from 'next/link';
import { getCategoryDetails, updateCategory } from '@/app/(dashboard)/products/actions';
import { toast } from 'react-toastify';
import { Upload as UploadIcon } from '@mui/icons-material';
import EditCategorySchema from '@/views/products/editCategory/EditCategorySchema';

const EditCategory = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(EditCategorySchema)
  });

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const response = await getCategoryDetails(id);
        if (response.success) {
          const categoryData = response.data.category_details;
          reset({
            name: categoryData.name,
            slug: categoryData.slug
          });
          setExistingImage(categoryData.image);
        } else {
          toast.error(response.message || 'Failed to fetch category details');
        }
      } catch (error) {
        toast.error(error.message || 'Error fetching category details');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [id, reset]);

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
      formData.append('type', 'product');

      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (existingImage) {
        formData.append('image', existingImage);
      }

      const response = await updateCategory(id, formData);
      if (response.success) {
        toast.success('Category updated successfully');
        router.push('/products/category-list');
      } else {
        toast.error(response.message || 'Failed to update category');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating category');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h4" color="secondary">
        Edit Category
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
                  {(imagePreview || existingImage) && (
                    <Box mt={2} display="flex" justifyContent="center">
                      <img
                        src={imagePreview || existingImage}
                        alt="Category"
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
                Update Category
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditCategory;
