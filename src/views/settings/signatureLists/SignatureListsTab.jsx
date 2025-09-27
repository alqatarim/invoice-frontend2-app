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

// Import existing components
import SignatureListView from './listSignatures/SignatureListView'
import { getInitialSignaturesData } from '@/app/(dashboard)/settings/actions'

const SignatureListsTab = ({ initialData = {}, enqueueSnackbar }) => {
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
                         <Button
                              component={Link}
                              href="/settings/signatures/add"
                              variant="contained"
                              startIcon={<Add />}
                         >
                              Add Signature
                         </Button>
                    </Box>

                    <SignatureListView
                         initialSignatures={signatures}
                         loading={loading}
                    />
               </CardContent>
          </Card>
     )
}

export default SignatureListsTab
