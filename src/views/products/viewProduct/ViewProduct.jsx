import React, { useCallback } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import PageIconHeader from '@components/headers/PageIconHeader';
import useEditProductViewHandler from '@/views/products/editProduct/handler';
import {
  ProductDetailsSection,
  ProductFormLoadingState,
  ProductFormTabbedSections,
  ProductPackagingConfigurationSection,
  ProductPricingConfigurationSection,
  ProductScaleBarcodeSection,
  ProductVariantsSection,
} from '@/views/products/product';

const emptyDropdownData = { units: [], categories: [], taxes: [] };

const getProductImage = (image) => (Array.isArray(image) ? image[0] : image);

const ProductReadOnlyImage = ({ imagePreview, productName, theme }) => {
  const image = getProductImage(imagePreview);

  return (
    <Box className='mb-6 flex justify-center'>
      <Box className='flex flex-col items-center gap-2'>
        {image ? (
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              overflow: 'hidden',
              width: { xs: '280px', sm: '320px', md: '350px' },
              height: '200px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.50',
              }}
            >
              <img
                src={image}
                alt={productName || 'Product Preview'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  borderRadius: 'inherit',
                  display: 'block',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  left: 8,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Chip label={productName || 'Product image'} size='small' color='info' variant='filled' />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: { xs: '180px', sm: '180px', md: '200px' },
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'secondary.light',
              borderRadius: 2,
              color: 'text.secondary',
            }}
          >
            <Icon icon='mdi:image-outline' width={36} color={theme.palette.text.secondary} />
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
              No image uploaded
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ViewProduct = ({
  productId,
  initialProductData = null,
  initialDropdownData = emptyDropdownData,
  onClose,
  onEdit,
}) => {
  const theme = useTheme();
  const handleNoopSave = useCallback(async () => ({ success: false }), []);

  const controller = useEditProductViewHandler({
    productId,
    initialProductData,
    initialDropdownData,
    onClose,
    onSave: handleNoopSave,
  });

  const watchName = controller.watch('name');
  const watchDiscountType = controller.watch('discountType');
  const watchType = controller.watch('type');
  const watchCategory = controller.watch('category');
  const isReadOnly = true;

  const handleEditProduct = () => {
    if (controller.productData?._id && onEdit) {
      onEdit(controller.productData._id);
    }
  };

  return (
    <Box className='flex flex-col gap-1'>
      <Box className='px-6 pb-4'>
        <PageIconHeader title='View Product' icon='mdi:eye-outline' />
      </Box>

      <Box className='overflow-visible pbs-0 pbe-0 pli-0'>
        {controller.loading ? (
          <ProductFormLoadingState />
        ) : controller.error ? (
          <Box className='flex flex-col justify-center items-center h-40 gap-4'>
            <Typography color='error' variant='h6'>
              Error Loading Product
            </Typography>
            <Typography color='error'>{controller.error}</Typography>
            <Button variant='outlined' color='primary' onClick={controller.retryLoad}>
              Retry
            </Button>
          </Box>
        ) : controller.productData ? (
          <Box className='p-6'>
            <ProductReadOnlyImage
              imagePreview={controller.imagePreview}
              productName={controller.productData?.name}
              theme={theme}
            />

            <ProductFormTabbedSections
              activeTab={controller.sectionState.activeSection}
              onTabChange={controller.sectionState.setActiveSection}
              tabs={[
                {
                  value: 'productDetails',
                  label: 'Details',
                  icon: 'ri-box-3-line',
                  content: (
                    <ProductDetailsSection
                      control={controller.control}
                      errors={controller.errors}
                      theme={theme}
                      watchName={watchName}
                      watchType={watchType}
                      watchCategory={watchCategory}
                      watchDiscountType={watchDiscountType}
                      productTypes={controller.productTypes}
                      discountTypes={controller.discountTypes}
                      dropdownData={controller.dropdownData}
                      loading={controller.loading}
                      isSubmitting={isReadOnly}
                      description='View the core product information'
                      tabMode
                    />
                  ),
                },
                {
                  value: 'variants',
                  label: 'Variants',
                  icon: 'mdi:layers-outline',
                  content: (
                    <ProductVariantsSection
                      advanced={controller.advanced}
                      disabled={isReadOnly}
                      description='View product options such as size, color, and variant-specific pricing'
                      tabMode
                    />
                  ),
                },
                {
                  value: 'packaging',
                  label: 'Packaging',
                  icon: 'mdi:package-variant-closed',
                  content: (
                    <ProductPackagingConfigurationSection
                      advanced={controller.advanced}
                      dropdownData={controller.dropdownData}
                      disabled={isReadOnly}
                      description='View shelf life, packaging units, and serial or IMEI tracking'
                      tabMode
                    />
                  ),
                },
                {
                  value: 'pricing',
                  label: 'Pricing',
                  icon: 'mdi:cash-multiple',
                  content: (
                    <ProductPricingConfigurationSection
                      advanced={controller.advanced}
                      disabled={isReadOnly}
                      description='View tiered pricing and promotional offers'
                      tabMode
                    />
                  ),
                },
                {
                  value: 'scaleBarcode',
                  label: 'Scale Barcode',
                  icon: 'mdi:scale-bathroom',
                  content: (
                    <ProductScaleBarcodeSection
                      advanced={controller.advanced}
                      disabled={isReadOnly}
                      description='View weighted item and scale barcode decoding settings'
                      tabMode
                    />
                  ),
                },
              ]}
            />
          </Box>
        ) : (
          <Box className='flex justify-center items-center h-40'>
            <Typography color='error'>Product not found</Typography>
          </Box>
        )}
      </Box>

      <Box className='flex justify-center gap-2 pbs-0 pbe-10 pli-10 sm:pbe-6 sm:pli-16'>
        <Button className='w-[140px]' color='secondary' variant='outlined' onClick={controller.handleClose}>
          Back
        </Button>
        {controller.productData && onEdit ? (
          <Button className='w-[140px]' variant='contained' onClick={handleEditProduct}>
            Edit Product
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

export default ViewProduct;
