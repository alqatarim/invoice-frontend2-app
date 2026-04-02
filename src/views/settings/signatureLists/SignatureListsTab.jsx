'use client'

import { useState } from 'react'
import {
     Card,
     CardContent,
     Typography,
     Box,
     CircularProgress,
     Alert,
     Button
} from '@mui/material'
import { Add } from '@mui/icons-material'
import Link from 'next/link'
import { usePermission } from '@/Auth/usePermission'

// Import existing components
import SignatureListView from './listSignatures/SignatureListView'

const SignatureListsTab = ({ initialData = {}, enqueueSnackbar }) => {
     const permissions = {
          canCreate: usePermission('signature', 'create'),
          canUpdate: usePermission('signature', 'update'),
          canDelete: usePermission('signature', 'delete'),
          canView: usePermission('signature', 'view')
     }
     const [signatures, setSignatures] = useState(initialData.signatures || [])
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState(null)

     if (loading) {
          return (
               <Card>
                    <CardContent>
                         <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                              <CircularProgress />
                         </Box>
                    </CardContent>
               </Card>
          )
     }

     if (error) {
          return (
               <Card>
                    <CardContent>
                         <Alert severity="error">
                              Error loading signatures: {error}
                         </Alert>
                    </CardContent>
               </Card>
          )
     }

     return (
          <Card>
               <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                         <Typography variant="h6">
                              Signature Lists
                         </Typography>
                         {permissions.canCreate ? (
                              <Button
                                   component={Link}
                                   href="/settings/signatures/add"
                                   variant="contained"
                                   startIcon={<Add />}
                              >
                                   Add Signature
                              </Button>
                         ) : null}
                    </Box>

                    <SignatureListView
                         initialSignatures={signatures}
                         loading={loading}
                         permissions={permissions}
                    />
               </CardContent>
          </Card>
     )
}

export default SignatureListsTab
