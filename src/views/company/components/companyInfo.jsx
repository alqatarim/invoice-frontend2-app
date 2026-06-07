'use client'

import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import { Controller } from 'react-hook-form'
import SectionHeader from '@components/headers/SectionHeader'

const CompanyInfo = ({
  register,
  control,
  errors,
  setValue,
  clearErrors,
  alwaysShrinkLabel,
  provinceOptions,
  cityOptions,
  citiesLoading,
  selectedProvince,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
      <SectionHeader title='Information' icon='ri-building-line' color='primary' className='mb-5' />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Company Name'
            {...register('companyName')}
            InputLabelProps={alwaysShrinkLabel}
            error={!!errors.companyName}
            helperText={errors.companyName?.message}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Company Email'
            type='email'
            {...register('email')}
            InputLabelProps={alwaysShrinkLabel}
            error={!!errors.email}
            helperText={errors.email?.message}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Phone'
            {...register('phone')}
            InputLabelProps={alwaysShrinkLabel}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='country'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.country}>
                <InputLabel id='company-country-label' shrink>
                  Country
                </InputLabel>
                <Select {...field} labelId='company-country-label' label='Country' notched>
                  <MenuItem key='Saudi Arabia' value='Saudi Arabia'>
                    Saudi Arabia
                  </MenuItem>
                </Select>
                {errors.country?.message ? (
                  <FormHelperText>{errors.country.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='state'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.state}>
                <InputLabel id='company-province-label' shrink>
                  Province
                </InputLabel>
                <Select
                  {...field}
                  labelId='company-province-label'
                  label='Province'
                  notched
                  displayEmpty
                  onChange={event => {
                    field.onChange(event.target.value)
                    setValue('city', '', { shouldValidate: false })
                    clearErrors('city')
                  }}
                >
                  <MenuItem value='' disabled>
                    Select Province
                  </MenuItem>
                  {provinceOptions.map(item => (
                    <MenuItem key={item.province} value={item.province}>
                      {item.display_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.state?.message ? (
                  <FormHelperText>{errors.state.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name='city'
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                required
                error={!!errors.city}
                disabled={!selectedProvince || citiesLoading}
              >
                <InputLabel id='company-city-label' shrink>
                  City
                </InputLabel>
                <Select {...field} labelId='company-city-label' label='City' notched displayEmpty>
                  <MenuItem value='' disabled>
                    {citiesLoading ? 'Loading cities...' : 'Select City'}
                  </MenuItem>
                  {cityOptions.map(city => (
                    <MenuItem key={city.name} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.city?.message ? (
                  <FormHelperText>{errors.city.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Address Line 1'
            {...register('addressLine1')}
            InputLabelProps={alwaysShrinkLabel}
            error={!!errors.addressLine1}
            helperText={errors.addressLine1?.message}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Address Line 2'
            {...register('addressLine2')}
            InputLabelProps={alwaysShrinkLabel}
            error={!!errors.addressLine2}
            helperText={errors.addressLine2?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label='Postal Code'
            {...register('postalCode')}
            InputLabelProps={alwaysShrinkLabel}
            error={!!errors.postalCode}
            helperText={errors.postalCode?.message}
            required
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default CompanyInfo
