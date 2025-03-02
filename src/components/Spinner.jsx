// ** MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Spinner = ({ sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        ...sx
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  )
}

export default Spinner