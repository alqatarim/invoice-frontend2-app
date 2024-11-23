'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale, id } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
            <MenuSection label={'Main'}>

            <MenuItem  icon={<i className='ri-home-smile-line' />} href={`/dashboard`}>Dashboard</MenuItem>

            </MenuSection>



  <MenuSection label="Customers">
    <MenuItem href="/customers">Customers</MenuItem>
    <MenuItem href="/vendors">Vendors</MenuItem>
  </MenuSection>
  <MenuSection label="Inventory">
    <SubMenu label="Product / Services">
      <MenuItem href="/products/product-list">Product List</MenuItem>
      <MenuItem href="/products/category">Category</MenuItem>
      <MenuItem href="/products/units">Units</MenuItem>
    </SubMenu>
    <MenuItem href="/inventory">Inventory</MenuItem>
  </MenuSection>
  <MenuSection label="Sales">
    <MenuItem href="/invoice-list">Invoice</MenuItem>
    <MenuItem href="/sales-return">Sales Return</MenuItem>
  </MenuSection>
  <MenuSection label="Purchases">
    <MenuItem href="/purchase-orders">Purchase Orders</MenuItem>
    <MenuItem href="/purchases">Purchases</MenuItem>
    <MenuItem href="/debit-notes">Purchase Return</MenuItem>
  </MenuSection>
  <MenuSection label="Finance & Accounts">
    <MenuItem href="/expenses">Expenses</MenuItem>
    <MenuItem href="/payments">Payments</MenuItem>
  </MenuSection>
  <MenuSection label="Quotations">
    <MenuItem href="/quotations">Quotations</MenuItem>
    <MenuItem href="/delivery-challans">Delivery Challans</MenuItem>
  </MenuSection>
  <MenuSection label="Reports">
    <MenuItem href="/payment-summary">Payment Summary</MenuItem>
  </MenuSection>
  <MenuSection label="Settings">
    <MenuItem href="/settings">Settings</MenuItem>
  </MenuSection>
  <MenuSection label="User Management">
    <SubMenu label="Manage Users">
      <MenuItem href="/users">Users</MenuItem>
    </SubMenu>
    <MenuItem href="/roles-permission">Roles & Permission</MenuItem>
  </MenuSection>
  <MenuItem href="/login">Logout</MenuItem>

  </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu