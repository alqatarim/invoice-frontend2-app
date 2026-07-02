'use client';

import Link from 'next/link';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Typography from '@mui/material/Typography';

const PolicyNavigationButtons = () => (
  <div className="flex justify-start mt-6 mb-3">
    <TabContext value="policies">
      <TabList variant="scrollable" scrollButtons="auto" aria-label="Policy module navigation">
        <Tab
          component={Link}
          href="/warranties/warranty-list"
          value="warranties"
          label='Warranties'
        />
        <Tab value="policies" label='Policies' />
        <Tab
          component={Link}
          href="/claims/claim-list"
          value="claims"
          label='Claims'
        />
      </TabList>
    </TabContext>
  </div>
);

export default PolicyNavigationButtons;
