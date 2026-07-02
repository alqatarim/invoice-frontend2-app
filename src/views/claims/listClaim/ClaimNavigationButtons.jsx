'use client';

import Link from 'next/link';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Typography from '@mui/material/Typography';

const ClaimNavigationButtons = () => (
  <div className="flex justify-start mt-6 mb-3">
    <TabContext value="claims">
      <TabList variant="scrollable" scrollButtons="auto" aria-label="Claim module navigation">
        <Tab
          component={Link}
          href="/warranties/warranty-list"
          value="warranties"
          label='Warranties'
        />
        <Tab
          component={Link}
          href="/policies/policy-list"
          value="policies"
          label='Policies'
        />
        <Tab value="claims" label='Claims' />
      </TabList>
    </TabContext>
  </div>
);

export default ClaimNavigationButtons;
