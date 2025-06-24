// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomerOverview from './CustomerOverview'
import CustomerSecurity from './CustomerSecurity'
import CustomerAddressBilling from './CustomerAddressBilling'
import CustomerNotifications from './CustomerNotifications'

const CustomerRight = ({ customerData, invoices, cardDetails }) => {
  // States
  const [activeTab, setActiveTab] = useState('overview')

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <TabContext value={activeTab}>
      <Card>
        <TabList onChange={handleChange} variant='scrollable' scrollButtons={false}>
          <Tab label='Overview' value='overview' />
          <Tab label='Security' value='security' />
          <Tab label='Address & Billing' value='address-billing' />
          <Tab label='Notifications' value='notifications' />
        </TabList>
        <CardContent>
          <TabPanel value='overview' className='p-0'>
            <CustomerOverview 
              customerData={customerData} 
              invoices={invoices} 
              cardDetails={cardDetails} 
            />
          </TabPanel>
          <TabPanel value='security' className='p-0'>
            <CustomerSecurity customerData={customerData} />
          </TabPanel>
          <TabPanel value='address-billing' className='p-0'>
            <CustomerAddressBilling customerData={customerData} />
          </TabPanel>
          <TabPanel value='notifications' className='p-0'>
            <CustomerNotifications customerData={customerData} />
          </TabPanel>
        </CardContent>
      </Card>
    </TabContext>
  )
}

export default CustomerRight