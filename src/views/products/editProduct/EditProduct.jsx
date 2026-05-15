import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageIconHeader from '@components/headers/PageIconHeader';
import {
  ProductDetailsSection,
  ProductFormLoadingState,
  ProductFormTabbedSections,
  ProductImageUploadField,
  ProductPackagingConfigurationSection,
  ProductPricingConfigurationSection,
  ProductScaleBarcodeSection,
  ProductVariantsSection,
} from '@/views/products/product';

const EditProduct = ({ controller }) => {
  const theme = useTheme();
  const watchName = controller.watch('name');
  const watchDiscountType = controller.watch('discountType');
  const watchType = controller.watch('type');
  const watchCategory = controller.watch('category');
  const formId = 'edit-product-form';

  return (
    <Box className='flex flex-col gap-1'>
      <Box className='px-6 pb-4'>
        <PageIconHeader title={controller.title} icon='mdi:package-variant' />
      </Box>

      <Box className='overflow-visible pbs-0 pbe-0 pli-0'>
        {controller.loading ? (
          <ProductFormLoadingState />
        ) : controller.error ? (
          <Box className='flex flex-col justify-center items-center h-40 gap-4'>
            <Typography color='error' variant='h6'>Error Loading Product</Typography>
            <Typography color='error'>{controller.error}</Typography>
            <Button
              variant='outlined'
              color='primary'
              onClick={controller.retryLoad}
            >
              Retry
            </Button>
          </Box>
        ) : controller.productData ? (
          <Box className='p-6'>
            <ProductImageUploadField
              control={controller.control}
              imagePreview={controller.imagePreview}
              selectedFile={controller.selectedFile}
              imageError={controller.imageError}
              handleImageChange={controller.handleImageChange}
              handleImageError={controller.handleImageError}
              handleImageDelete={controller.handleImageDelete}
              isDragging={controller.isDragging}
              handleDragEnter={controller.handleDragEnter}
              handleDragLeave={controller.handleDragLeave}
              handleDragOver={controller.handleDragOver}
              handleDrop={controller.handleDrop}
              isSubmitting={false}
              theme={theme}
              alt={controller.productData?.name || 'Product'}
              inputIdPrefix='edit-product-image'
            />

            <form onSubmit={controller.handleSubmit(controller.handleFormSubmit)} id={formId}>
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
                        isSubmitting={false}
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
                        disabled={controller.loading}
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
                        disabled={controller.loading}
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
                        disabled={controller.loading}

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
                        disabled={controller.loading}
                        tabMode
                      />
                    ),
                  },
                ]}
              />
            </form>
          </Box>
        ) : (
          <Box className='flex justify-center items-center h-40'>
            <Typography color='error'>Failed to load product data</Typography>
          </Box>
        )}
      </Box>

      <Box className='flex gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-6 sm:pli-16'>
        <Button
          className='w-[140px]'
          variant='outlined'
          color='secondary'
          onClick={controller.handleClose}
          disabled={controller.isSubmitting}
        >
          Back
        </Button>
        <Button
          className='w-[140px]'
          type='submit'
          form={formId}
          variant='contained'
          disabled={controller.isSubmitting || controller.loading || !controller.productData}
        >
          Update
        </Button>
      </Box>
    </Box>
  );
};

export default EditProduct;