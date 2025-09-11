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
  CircularProgress
} from '@mui/material';
import Link from 'next/link';
import { getUnitDetails, updateUnit } from '@/app/(dashboard)/products/actions';
import { toast } from 'react-toastify';
import EditUnitSchema from '@/views/products/editUnit/EditUnitSchema';

const EditUnit = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(EditUnitSchema)
  });

  useEffect(() => {
    const fetchUnitDetails = async () => {
      try {
        const response = await getUnitDetails(id);
        if (response.success) {
          reset({
            name: response.data.name,
            symbol: response.data.symbol
          });
        } else {
          toast.error(response.message || 'Failed to fetch unit details');
        }
      } catch (error) {
        toast.error(error.message || 'Error fetching unit details');
      } finally {
        setLoading(false);
      }
    };

    fetchUnitDetails();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await updateUnit(id, data);
      if (response.success) {
        toast.success('Unit updated successfully');
        router.push('/products/unit-list');
      } else {
        toast.error(response.message || 'Failed to update unit');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating unit');
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
        Edit Unit
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
                  label="Symbol"
                  {...register('symbol')}
                  error={!!errors.symbol}
                  helperText={errors.symbol?.message}
                  required
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button
                component={Link}
                href="/products/unit-list"
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
                Update Unit
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditUnit;