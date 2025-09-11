'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AddUnitSchema from '@/views/products/addUnit/AddUnitSchema';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { addUnit } from '@/app/(dashboard)/products/actions';
import { toast } from 'react-toastify';

const AddUnit = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(AddUnitSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await addUnit(data);
      if (response.success) {
        toast.success('Unit added successfully');
        router.push('/products/unit-list');
      } else {
        toast.error(response.message || 'Failed to add unit');
      }
    } catch (error) {
      toast.error(error.message || 'Error adding unit');
    }
  };

  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h4" color="secondary">
        Add Unit
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
                Add Unit
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddUnit;