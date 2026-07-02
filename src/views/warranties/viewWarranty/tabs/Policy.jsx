'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import SectionHeader from '@/components/headers/SectionHeader';

export default function Policy({ warranty, minHeight }) {
  return (
    <Card sx={{ minHeight: { xs: 'auto', md: minHeight } }}>
      <CardContent className='px-8 py-7'>
        <Stack spacing={4}>
          <SectionHeader title='Policy Snapshot' icon="ri-file-list-3-line" iconSize={30} />

          <Stack spacing={3}>
            <Box className="">
              <Typography variant="h7">
                Coverage Terms
              </Typography>

              <Typography variant="body2" whiteSpace="pre-wrap">
                {warranty.policySnapshot?.termsAndConditions || 'No terms provided.'}
              </Typography>
            </Box>

            {warranty.policySnapshot?.exclusions ? (
              <Box className="">
                <Typography variant="h7">
                  Exclusions
                </Typography>

                <Typography variant="body2" whiteSpace="pre-wrap">
                  {warranty.policySnapshot.exclusions}
                </Typography>
              </Box>
            ) : null}

            {warranty.policySnapshot?.instructions ? (
              <Box className="">
                <Typography variant="h7">
                  Instructions
                </Typography>

                <Typography variant="body2" whiteSpace="pre-wrap">
                  {warranty.policySnapshot.instructions}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
