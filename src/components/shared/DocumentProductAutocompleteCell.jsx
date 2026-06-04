import React from 'react';
import { Controller } from 'react-hook-form';
import { Box } from '@mui/material';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';

export default function DocumentProductAutocompleteCell({
  control,
  errors,
  index,
  productData = [],
  products = [],
  watchItems = [],
  handleUpdateItemProduct,
  disabled = false,
  autoFocusFirstProductCell = false,
  preventBlurOnMouseDown = false,
}) {
  const allProducts = Array.isArray(productData) ? productData : [];
  const availableProducts = Array.isArray(products) ? products : [];

  const resolveProductById = productId => {
    if (!productId) return null;
    return allProducts.find(product => String(product._id) === String(productId)) || null;
  };

  return (
    <Controller
      name={`items.${index}.productId`}
      control={control}
      render={({ field }) => {
        const watched = watchItems?.[index] || {};
        const selectedProduct =
          resolveProductById(field.value) ||
          (watched.productId
            ? {
              _id: watched.productId,
              name: watched.name || '',
              sku: watched.sku || '',
              category: watched.category || null,
            }
            : null);

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <ProductAutocomplete
              availableProducts={availableProducts}
              allProducts={allProducts}
              selectedProduct={selectedProduct}
              disabled={disabled}
              autoFocus={autoFocusFirstProductCell && index === 0}
              error={!!errors.items?.[index]?.productId}
              preventBlurOnMouseDown={preventBlurOnMouseDown}
              onChange={newValue => {
                if (!newValue?._id) {
                  field.onChange('');
                  return;
                }

                field.onChange(newValue._id);
                handleUpdateItemProduct(index, newValue._id, field.value);
              }}
            />
          </Box>
        );
      }}
    />
  );
}
