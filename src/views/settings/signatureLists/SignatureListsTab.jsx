'use client'

import { useState, useEffect } from 'react'
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
import { getInitialSignaturesData } from '@/app/(dashboard)/settings/actions'

const SignatureListsTab = ({ initialData = {}, enqueueSnackbar }) => {
     const permissions = {
          canCreate: usePermission('signature', 'create'),
          canUpdate: usePermission('signature', 'update'),
          canDelete: usePermission('signature', 'delete'),
          canView: usePermission('signature', 'view')
     }
     const [signatures, setSignatures] = useState(initialData.signatures || [])
     const [loading, setLoading] = useState(!Array.isArray(initialData.signatures))
     const [error, setError] = useState(null)

     // Load signatures data only if not provided as initial data
     useEffect(() => {
          if (!Array.isArray(initialData.signatures) || initialData.signatures.length === 0) {
               const loadData = async () => {
                    try {
                         setLoading(true)
                         const result = await getInitialSignaturesData()
                         if (result.success) {
                              setSignatures(result.data || [])
                         } else {
                              setError(result.message)
                         }
                    } catch (err) {
                         setError(err.message)
                    } finally {
                         setLoading(false)
                    }
               }

               loadData()
          }
     }, [initialData.signatures])

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
