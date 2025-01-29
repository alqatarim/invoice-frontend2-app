'use client';

import { useEffect, useState } from 'react';
import { getVendors, getProducts, getTaxRates, getBanks, getPurchaseNumber, getSignatures } from '@/app/(dashboard)/purchases/actions';
import AddPurchase from '@/views/purchases/addPurchase/AddPurchase';
import { Box, Card, CardContent, Grid, Skeleton } from '@mui/material';

const AddPurchaseIndex = ({id}) => {

  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [banks, setBanks] = useState([]);
  const [signatures, setSignatures] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setVendors(await getVendors());
        setProducts(await getProducts());
        setTaxRates(await getTaxRates());
        setBanks(await getBanks());
        setSignatures(await getSignatures());

      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setIsLoading(false);

      }
    };

    fetchData();
 }, [id]);

  if (isLoading) {
    return (
      <Box className="flex flex-col gap-4 p-4">
        <Skeleton variant="text" width={200} height={40} />

        <Card>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Skeleton variant="text" width={100} height={32} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Skeleton variant="text" width={100} height={32} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Skeleton variant="rectangular" width={200} height={40} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={150} height={32} />
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={100} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={150} height={32} />
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={100} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box className="mt-6 flex justify-end gap-2">
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
      </Box>
    );
  }

  return <AddPurchase vendors={vendors} products={products} taxRates={taxRates} banks={banks} signatures={signatures} purchaseNumber={purchaseNumber} />;
};

export default AddPurchaseIndex;