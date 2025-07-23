'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import { FormControlLabel } from '@mui/material'

// Third-party Imports
import { countries } from 'country-codes-flags-phone-codes'

// CSS Import for flag icons
import 'flag-icons/css/flag-icons.min.css'

// Helper function to get flag CSS class
const getFlagIcon = (countryCode) => {
  if (!countryCode) return null
  
  return (
    <span 
      className={`fi fi-${countryCode.toLowerCase()}`}
      style={{ marginRight: '8px' }}
      title={countryCode}
    />
  )
}

// Helper function to get country code from country name
const getCountryCodeFromName = (countryName) => {
  if (!countryName) return null
  const country = countries.find(c => c.name === countryName)
  return country ? country.code : null
}

// Helper function to get country name from country code (for backwards compatibility)
const getCountryNameFromCode = (countryCode) => {
  if (!countryCode) return ''
  const country = countries.find(c => c.code === countryCode)
  return country ? country.name : countryCode // fallback to code if not found
}

// Vars
const initialData = {
  firstName: 'Oliver',
  lastName: 'Queen',
  userName: 'oliverQueen',
  billingEmail: 'oliverQueen@gmail.com',
  status: 'status',
  taxId: 'Tax-8894',
  contact: '+ 1 609 933 4422',
  language: ['english'],
  country: 'United States',
  useAsBillingAddress: true
}

const status = ['Status', 'Active', 'Inactive', 'Suspended']
const languages = ['English', 'Spanish', 'French', 'German', 'Hindi']

const EditUserInfo = ({ open, setOpen, data }) => {
  // States
  const [userData, setUserData] = useState(data || initialData)
  const [countrySearch, setCountrySearch] = useState('')

  const handleClose = () => {
    setOpen(false)
    setUserData(initialData)
    setCountrySearch('')
  }

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit User Information
        <Typography component='span' className='flex flex-col text-center'>
          Updating user details will receive a privacy audit.
        </Typography>
      </DialogTitle>
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='First Name'
                placeholder='John'
                value={userData?.firstName}
                onChange={e => setUserData({ ...userData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Last Name'
                placeholder='Doe'
                value={userData?.lastName}
                onChange={e => setUserData({ ...userData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='User Name'
                placeholder='JohnDoe'
                value={userData?.userName}
                onChange={e => setUserData({ ...userData, userName: e.target.value })}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Billing Email'
                placeholder='johnDoe@email.com'
                value={userData?.billingEmail}
                onChange={e => setUserData({ ...userData, billingEmail: e.target.value })}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
                  value={userData?.status}
                  onChange={e => setUserData({ ...userData, status: e.target.value })}
                >
                  {status.map((status, index) => (
                    <MenuItem key={index} value={status.toLowerCase().replace(/\s+/g, '-')}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Tax ID'
                placeholder='Tax-7490'
                value={userData?.taxId}
                onChange={e => setUserData({ ...userData, taxId: e.target.value })}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Contact'
                placeholder='+ 123 456 7890'
                value={userData?.contact}
                onChange={e => setUserData({ ...userData, contact: e.target.value })}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  label='Language'
                  multiple
                  value={userData?.language}
                  onChange={e => setUserData({ ...userData, language: e.target.value })}
                  renderValue={selected => (
                    <div className='flex items-center gap-2 flex-wrap'>
                      {selected.map(value => (
                        <Chip key={value} label={value} className='capitalize' size='small' />
                      ))}
                    </div>
                  )}
                >
                  {languages.map((language, index) => (
                    <MenuItem key={index} value={language.toLowerCase().replace(/\s+/g, '-')}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  label='Country'
                  value={userData?.country}
                  onChange={e => setUserData({ ...userData, country: e.target.value })}
                  renderValue={(selected) => {
                    if (!selected) return ''
                    const countryCode = getCountryCodeFromName(selected)
                    return (
                      <div className='flex items-center gap-2'>
                        {getFlagIcon(countryCode)}
                        <span>{selected}</span>
                      </div>
                    )
                  }}
                  sx={{
                    minWidth: '200px', // Ensure consistent width
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                        minHeight: 300, // Consistent dropdown height
                        width: 'auto',
                        minWidth: '280px', // Prevent width fluctuation
                      },
                    },
                    MenuListProps: {
                      style: { 
                        paddingTop: 0,
                        minHeight: '250px', // Maintain consistent content area
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {/* Search field at the top of dropdown - NOT disabled */}
                  <Box sx={{ 
                    px: 2, 
                    py: 1.5, 
                    position: 'sticky', 
                    top: 0, 
                    backgroundColor: 'background.paper', 
                    zIndex: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 1
                  }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <i className="ri-search-line" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '1px',
                          },
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Country options - NO Box wrapper */}
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <MenuItem 
                        key={country.code} 
                        value={country.name}
                        sx={{
                          minHeight: '48px', // Consistent item height
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          {getFlagIcon(country.code)}
                          <span>{country.name}</span>
                        </div>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      minHeight: '100px',
                      p: 2
                    }}>
                      <Typography variant="body2" color="textSecondary">
                        No countries found
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch defaultChecked={userData?.useAsBillingAddress} />}
                label='Use as a billing address?'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={handleClose} type='submit'>
            Submit
          </Button>
          <Button variant='outlined' color='secondary' type='reset' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditUserInfo
