'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
     Avatar,
     Box,
     Button,
     CircularProgress,
     Dialog,
     DialogActions,
     DialogContent,
     DialogTitle,
     Divider,
     FormControl,
     FormHelperText,
     Grid,
     IconButton,
     InputAdornment,
     InputLabel,
     MenuItem,
     Select,
     TextField,
     Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import SectionHeader from '@components/headers/SectionHeader';
import { genderOptions } from '@/data/dataSets';
import UserAccessSection from './UserAccessSection';

const getGenderLabel = value => {
     const match = genderOptions.find(option => option.id.toString() === String(value));
     return match?.text || value || 'N/A';
};

const DIALOG_PAPER_PROPS = {
     sx: {
          mt: { xs: 4, sm: 6 },
          width: '100%',
          minWidth: { xs: '90vw', sm: '600px', md: '800px' },
          minHeight: { xs: 'auto', sm: '400px' },
          maxHeight: '90vh',
     },
};

const User = ({
     controller,
     title,
     subtitle,
     submitLabel,
     closeLabel = 'Cancel',
}) => {
     const {
          mode,
          control,
          handleSubmit,
          handleFormSubmit,
          handleFormError,
          errors,
          isSubmitting,
          handleClose,
          isViewMode,
          isEditMode,
          userData,
          loading,
          error,
          retryLoad,
          previewImage,
          getRootProps,
          getInputProps,
          handleRemoveImage,
          roles,
          branchOptions,
          appendAccessRow,
          setValue,
          showPassword,
          showConfirmPassword,
          toggleShowPassword,
          toggleShowConfirmPassword,
     } = controller;

     const formId = `${mode}-user-form`;
     const canRenderForm = mode === 'add' || Boolean(userData);
     const fieldLocked = isViewMode || isSubmitting;

     const renderTextField = (name, label, options = {}) => (
          <Controller
               name={name}
               control={control}
               render={({ field }) => (
                    <TextField
                         {...field}
                         label={label}
                         fullWidth
                         error={!isViewMode && !!errors[name]}
                         helperText={!isViewMode ? errors[name]?.message : undefined}
                         disabled={fieldLocked}
                         InputProps={{
                              readOnly: isViewMode,
                              ...options.inputProps,
                         }}
                         type={options.type}
                    />
               )}
          />
     );

     const renderReadOnlySelectAsText = (name, label, resolveDisplay) => (
          <Controller
               name={name}
               control={control}
               render={({ field }) => (
                    <TextField
                         label={label}
                         value={resolveDisplay(field.value)}
                         fullWidth
                         InputProps={{ readOnly: true }}
                    />
               )}
          />
     );

     const formBody = (
          <Grid container spacing={3}>
               <Grid size={{ xs: 12 }}>
                    <Box className="flex flex-col items-center gap-4 mb-[-15px]">
                         {isViewMode ? (
                              <Avatar
                                   src={previewImage}
                                   alt="User"
                                   sx={{ width: 100, height: 100 }}
                              />
                         ) : (
                              <>
                                   <Box
                                        className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                        {...getRootProps()}
                                   >
                                        {previewImage ? (
                                             <Avatar src={previewImage} alt="Preview" sx={{ width: 100, height: 100 }} />
                                        ) : (
                                             <Icon icon="mdi:camera-plus" className="text-2xl text-primary/60" />
                                        )}
                                   </Box>
                                   <Box>
                                        <Button
                                             variant="text"
                                             color='primary'
                                             size='small'
                                             // skin='light'
                                             component="label"
                                             startIcon={<Icon icon="mdi:upload" />}
                                             disabled={fieldLocked}
                                        >
                                             Upload Image
                                             <input {...getInputProps()} hidden />
                                        </Button>
                                        {previewImage && (
                                             <Button
                                                  size='small'
                                                  variant="text"
                                                  color="error"
                                                  onClick={handleRemoveImage}
                                                  className="ml-2"
                                                  disabled={fieldLocked}
                                             >
                                                  Remove
                                             </Button>
                                        )}
                                   </Box>
                              </>
                         )}
                    </Box>
               </Grid>



               <Grid size={{ xs: 12 }}>
                    <SectionHeader
                         title="Basic Info"
                         icon="mdi:account-outline"
                         className="mb-1"
                    />
               </Grid>

               <Grid size={{ xs: 12, md: 4, sm: 6 }}>{renderTextField('firstName', 'First Name')}</Grid>
               <Grid size={{ xs: 12, md: 4, sm: 6 }}>{renderTextField('lastName', 'Last Name')}</Grid>
               <Grid size={{ xs: 12, md: 4, sm: 6 }}>{renderTextField('userName', 'Username')}</Grid>
               <Grid size={{ xs: 12, md: 4, sm: 6 }}>{renderTextField('email', 'Email', { type: 'email' })}</Grid>
               <Grid size={{ xs: 12, md: 4, sm: 6 }}>{renderTextField('mobileNumber', 'Mobile Number')}</Grid>
               <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                    {isViewMode ? (
                         renderReadOnlySelectAsText('gender', 'Gender', getGenderLabel)
                    ) : (
                         <Controller
                              name="gender"
                              control={control}
                              render={({ field }) => (
                                   <FormControl fullWidth error={!!errors.gender}>
                                        <InputLabel>Gender</InputLabel>
                                        <Select {...field} label="Gender" disabled={fieldLocked}>
                                             <MenuItem value="">
                                                  <em>Select Gender</em>
                                             </MenuItem>
                                             {genderOptions.map(gender => (
                                                  <MenuItem key={gender.id} value={gender.id.toString()}>
                                                       {gender.text}
                                                  </MenuItem>
                                             ))}
                                        </Select>
                                        {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                                   </FormControl>
                              )}
                         />
                    )}
               </Grid>



               <Grid size={{ xs: 12 }} className='mt-3'>
                    <UserAccessSection
                         control={control}
                         errors={errors}
                         isViewMode={isViewMode}
                         fieldLocked={fieldLocked}
                         roles={roles}
                         branchOptions={branchOptions}
                         userData={userData}
                         appendAccessRow={appendAccessRow}
                         setValue={setValue}
                    />
               </Grid>

               {!isEditMode && !isViewMode && (
                    <>
                         <Grid size={{ xs: 12, sm: 6 }}>
                              <Controller
                                   name="password"
                                   control={control}
                                   render={({ field }) => (
                                        <TextField
                                             {...field}
                                             label="Password"
                                             type={showPassword ? 'text' : 'password'}
                                             fullWidth
                                             error={!!errors.password}
                                             helperText={errors.password?.message}
                                             disabled={isSubmitting}
                                             InputProps={{
                                                  endAdornment: (
                                                       <InputAdornment position="end">
                                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                                 <Icon icon={showPassword ? 'mdi:eye' : 'mdi:eye-off'} />
                                                            </IconButton>
                                                       </InputAdornment>
                                                  ),
                                             }}
                                        />
                                   )}
                              />
                         </Grid>
                         <Grid size={{ xs: 12, sm: 6 }}>
                              <Controller
                                   name="confirmPassword"
                                   control={control}
                                   render={({ field }) => (
                                        <TextField
                                             {...field}
                                             label="Confirm Password"
                                             type={showConfirmPassword ? 'text' : 'password'}
                                             fullWidth
                                             error={!!errors.confirmPassword}
                                             helperText={errors.confirmPassword?.message}
                                             disabled={isSubmitting}
                                             InputProps={{
                                                  endAdornment: (
                                                       <InputAdornment position="end">
                                                            <IconButton onClick={toggleShowConfirmPassword} edge="end">
                                                                 <Icon icon={showConfirmPassword ? 'mdi:eye' : 'mdi:eye-off'} />
                                                            </IconButton>
                                                       </InputAdornment>
                                                  ),
                                             }}
                                        />
                                   )}
                              />
                         </Grid>
                    </>
               )}
          </Grid>
     );

     const dialogContent = loading ? (
          <Box className="flex items-center justify-center py-20">
               <Box className="text-center">
                    <CircularProgress size={48} thickness={4} />
                    <Typography variant="body1" className="mt-4" color="text.secondary">
                         Loading user details...
                    </Typography>
               </Box>
          </Box>
     ) : error ? (
          <Box className="flex flex-col justify-center items-center py-20 gap-4">
               <Typography color="error" variant="h6">
                    Error Loading User
               </Typography>
               <Typography color="error">{error}</Typography>
               <Button variant="outlined" color="primary" onClick={() => void retryLoad?.()}>
                    Retry
               </Button>
          </Box>
     ) : canRenderForm ? (
          formBody
     ) : (
          <Box className="flex justify-center items-center h-40">
               <Typography color="error">Failed to load user data</Typography>
          </Box>
     );

     const formFields = (
          <Box className="p-6">
               {subtitle && (
                    <Typography variant="body2" color="text.secondary" className="mb-4">
                         {subtitle}
                    </Typography>
               )}
               {dialogContent}
          </Box>
     );

     return (
          <Dialog
               fullWidth
               open
               onClose={handleClose}
               maxWidth="md"
               scroll="body"
               sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
               PaperProps={DIALOG_PAPER_PROPS}
          >
               <DialogTitle
                    variant="h4"
                    className=" text-[21px] flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16"
               >
                    {title}
               </DialogTitle>

               <DialogContent className="overflow-visible pbs-0 pbe-3 pli-0" sx={{ p: 0 }}>
                    <IconButton
                         onClick={handleClose}
                         className="absolute block-start-4 inline-end-4"
                         disabled={isSubmitting || loading}
                    >
                         <i className="ri-close-line text-textSecondary" />
                    </IconButton>

                    {isViewMode ? (
                         formFields
                    ) : (
                         <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} id={formId}>
                              {formFields}
                         </form>
                    )}
               </DialogContent>

               {isViewMode ? (
                    <DialogActions className="flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-6 sm:pli-16">
                         <Button variant="outlined" color="secondary" onClick={handleClose} disabled={isSubmitting || loading}>
                              {closeLabel}
                         </Button>
                    </DialogActions>
               ) : (
                    <DialogActions className="gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-6 sm:pli-16">
                         <Button variant="outlined" color="secondary" onClick={handleClose} disabled={isSubmitting || loading}>
                              {closeLabel}
                         </Button>
                         <Button
                              type="submit"
                              form={formId}
                              variant="contained"
                              disabled={isSubmitting || loading || (isEditMode && !userData)}
                         >
                              {submitLabel}
                         </Button>
                    </DialogActions>
               )}
          </Dialog>
     );
};

export default User;
