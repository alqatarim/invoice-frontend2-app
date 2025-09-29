export const paymentMethods = [
	{ value: "Cash", label: "Cash" },
	{ value: "Cheque", label: "Cheque" },
	{ value: "Bank", label: "Bank" },
	{ value: "Online", label: "Online" },
];

// Customer related constants
export const customerStatusOptions = [
	{ value: "Active", label: "Active", color: "success" },
	{ value: "Deactive", label: "Inactive", color: "error" },
];

export const customerTabs = [
	{ value: "ALL", label: "All" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "INACTIVE", label: "Inactive" },
];

export const customerTableColumns = [
	{ id: "name", label: "Customer Name", sortable: true, visible: true },
	{ id: "email", label: "Email", sortable: true, visible: true },
	{ id: "phone", label: "Phone", sortable: false, visible: true },
	{ id: "status", label: "Status", sortable: true, visible: true },
	{ id: "balance", label: "Balance", sortable: true, visible: true },
	{ id: "createdAt", label: "Created Date", sortable: true, visible: false },
	{ id: "actions", label: "Actions", sortable: false, visible: true },
];

export const statusOptions = [
	{
		value: "REFUND",
		label: "Refund",
		color: "secondary",
		get icon() { return getFormIcon("refund"); },
	},
	{ value: "SENT", label: "Sent", color: "info", get icon() { return getFormIcon("sent"); } },
	{ value: "UNPAID", label: "Unpaid", color: "warning", get icon() { return getFormIcon("unpaid"); } },
	{
		value: "PARTIALLY_PAID",
		label: "Partial Paid",
		color: "warning",
		get icon() { return getFormIcon("partiallyPaid"); },
	},
	{
		value: "PARTIALLY PAID",
		label: "Partial Paid",
		color: "warning",
		get icon() { return getFormIcon("partiallyPaid"); },
	},
	{
		value: "CANCELLED",
		label: "Cancelled",
		color: "secondary",
		get icon() { return getFormIcon("cancelled"); },
	},
	{
		value: "OVERDUE",
		label: "Overdue",
		color: "error",
		get icon() { return getFormIcon("overdue"); },
	},
	{
		value: "PAID",
		label: "Paid",
		color: "success",
		get icon() { return getFormIcon("paid"); },
	},
	{
		value: "DRAFTED",
		label: "Drafted",
		color: "secondary",
		get icon() { return getFormIcon("drafted"); },
	},
	{
		value: "Active",
		label: "Active",
		color: "info",
		get icon() { return getFormIcon("active"); },
	},
];

export const paymentSummaryStatus = [
	{ value: "REFUND", label: "Refund", color: "secondary" },
	{ value: "SENT", label: "Sent", color: "info" },
	{ value: "UNPAID", label: "Unpaid", color: "warning" },
	{ value: "PARTIALLY_PAID", label: "Partial Paid", color: "warning" },
	{ value: "Cancelled", label: "Cancelled", color: "secondary" },
	{ value: "OVERDUE", label: "Overdue", color: "error" },
	{ value: "PAID", label: "Paid", color: "success" },
	{ value: "DRAFTED", label: "Drafted", color: "secondary" },
	{ value: "Success", label: "Success", color: "success" },
	{ value: "Failed", label: "Failed", color: "error" },
	{ value: "Active", label: "Active", color: "info" },
];

export const invoiceTabs = [
	{ value: "ALL", label: "All" },
	{ value: "PAID", label: "Paid" },
	{ value: "OVERDUE", label: "Overdue" },
	{ value: "PARTIALLY_PAID", label: "Partially Paid" },
	{ value: "DRAFTED", label: "Draft" },
	{ value: "CANCELLED", label: "Cancelled" },
];

export const purchaseOrderTabs = [
	{ value: "ALL", label: "All" },
	{ value: "PENDING", label: "Pending" },
	{ value: "APPROVED", label: "Approved" },
	{ value: "REJECTED", label: "Rejected" },
	{ value: "DRAFTED", label: "Draft" },
	{ value: "CONVERTED", label: "Converted" },
];

export const debitNoteTabs = [
	{ value: "ALL", label: "All" },
	{ value: "PAID", label: "Paid" },
	{ value: "OVERDUE", label: "Overdue" },
	{ value: "PARTIALLY_PAID", label: "Partially Paid" },
	{ value: "DRAFTED", label: "Draft" },
	{ value: "CANCELLED", label: "Cancelled" },
];

export const paymentMethodIcons = [
	{ value: "Cash", get label() { return getFormIcon("cash"); } },
	{ value: "Cheque", get label() { return getFormIcon("cheque"); } },
	{ value: "Bank", get label() { return getFormIcon("bank"); } },
	{ value: "Online", get label() { return getFormIcon("online"); } },
	{ value: "Credit Card", get label() { return getFormIcon("creditCard"); } },
];

export const vendorBalanceTypes = [
	{ value: "Credit", label: "Credit" },
	{ value: "Debit", label: "Debit" },
];

export const vendorStatusOptions = [
	{ value: true, label: "Active", color: "success" },
	{ value: false, label: "Inactive", color: "error" },
];

// Product related constants
export const productTypes = [
	{ value: "product", label: "Product" },
	{ value: "service", label: "Service" },
];

export const discountTypes = [
	{ value: "2", label: "Percentage" },
	{ value: "3", label: "Fixed" },
];

export const productTabs = [
	{ value: "PRODUCT", label: "Products" },
	{ value: "CATEGORY", label: "Categories" },
	{ value: "UNIT", label: "Units" },
];

export const productStatusOptions = [
	{ value: true, label: "Active", color: "success" },
	{ value: false, label: "Inactive", color: "error" },
];

export const ledgerModes = [
	{ value: "Credit", label: "Credit", color: "success" },
	{ value: "Debit", label: "Debit", color: "error" },
];

// // Gender options for profile forms
// export const genderOptions = [
//   { value: '', label: 'Select Gender' },
//   { value: 2, label: 'Male', icon: 'mdi:gender-male' },
//   { value: 3, label: 'Female', icon: 'mdi:gender-female' },
//   { value: 'other', label: 'Other', icon: '' }
// ]

// Gender options matching old implementation
export const genderOptions = [
	{ id: 2, text: "Male" },
	{ id: 3, text: "Female" },
];

// Profile tabs for the profile page
export const profileTabs = [
	{ value: "profile", label: "Profile", icon: "ri-user-3-line" },
	{ value: "teams", label: "Teams", icon: "ri-team-line" },
	{ value: "projects", label: "Projects", icon: "ri-computer-line" },
	{ value: "connections", label: "Connections", icon: "ri-link-m" },
];

// Role options with icon for user roles
export const roleOptions = [
	{
		value: "Super Admin",
		label: "Super Admin",
		icon: "mdi:shield-user-outline",
	},
	{ value: "admin", label: "Admin", icon: "mdi:user-star-outline" },
	{ value: "manager", label: "Manager", icon: "mdi:user-star-outline" },
	{ value: "user", label: "User", icon: "mdi:user-outline" },
	{ value: "accountant", label: "Accountant", icon: "mdi:account-tie-outline" },
	{ value: "developer", label: "Developer", icon: "ri-code-s-slash-line" },
	{ value: "guest", label: "Guest", icon: "ri-user-2-line" },
];

// Icon mapping for personal info fields
export const profilePersonalInfoIcons = {
	"first name": "ri-user-line",
	"last name": "ri-user-line",
	username: "ri-at-line",
	email: "ri-mail-line",
	phone: "ic:round-phone-iphone",
	role: "ri-user-star-line",
	status: "pajamas:status",
	gender: "mdi:gender-male",
	"birth date": "mdi:birthday-cake-outline",
};

// Icon mapping for address info fields
export const profileAddressInfoIcons = {
	address: "ri-map-pin-line",
	city: "ri-building-line",
	state: "ri-road-map-line",
	country: "ri-earth-line",
	"postal code": "ri-mail-send-line",
};

// Settings tabs for the settings page - matching old implementation exactly
export const settingsTabs = [
	{
		value: "account",
		label: "Account Settings",
		icon: "ri-user-settings-line",
	},
	{ value: "company", label: "Company Settings", icon: "ri-building-line" },
	{
		value: "changePassword",
		label: "Change Password",
		icon: "ri-shield-user-line",
	},
	{
		value: "notification",
		label: "Notifications",
		icon: "ri-notification-3-line",
	},
	{
		value: "invoiceTemplates",
		label: "Invoice Templates",
		icon: "ri-layout-3-line",
	},
	{
		value: "signatureLists",
		label: "List of Signature",
		icon: "ri-quill-pen-line",
	},
	{ value: "invoice", label: "Invoice Settings", icon: "ri-file-text-line" },
	{ value: "payment", label: "Payment Settings", icon: "ri-bank-card-line" },
	{ value: "bank", label: "Bank Settings", icon: "ri-bank-line" },
	{ value: "tax", label: "Tax Rates", icon: "ri-file-text-line" },
	{ value: "email", label: "Email Settings", icon: "ri-mail-settings-line" },
	{
		value: "preference",
		label: "Preference Settings",
		icon: "ri-settings-3-line",
	},
];

// Delivery Challan tabs for filtering
// Quotation tabs for filtering
export const quotationTabs = [
	{ value: "ALL", label: "All" },
	{ value: "ACCEPTED", label: "Accepted" },
	{ value: "DRAFTED", label: "Draft" },
	{ value: "SENT", label: "Sent" },
	{ value: "EXPIRED", label: "Expired" },
	{ value: "REJECTED", label: "Rejected" },
	{ value: "CONVERTED", label: "Converted" },
];

// Quotation status options
export const quotationStatusOptions = [
	{
		value: "ACCEPTED",
		label: "Accepted",
		color: "success",
		get icon() { return getFormIcon("accepted"); },
	},
	{
		value: "DRAFTED",
		label: "Draft",
		color: "secondary",
		get icon() { return getFormIcon("drafted"); },
	},
	{ value: "SENT", label: "Sent", color: "info", get icon() { return getFormIcon("sent"); } },
	{
		value: "EXPIRED",
		label: "Expired",
		color: "warning",
		get icon() { return getFormIcon("expired"); },
	},
	{
		value: "REJECTED",
		label: "Rejected",
		color: "error",
		get icon() { return getFormIcon("rejected"); },
	},
	{
		value: "CONVERTED",
		label: "Converted",
		color: "primary",
		get icon() { return getFormIcon("converted"); },
	},
];

export const deliveryChallanTabs = [
	{ value: "ALL", label: "All" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "CONVERTED", label: "Converted" },
	{ value: "CANCELLED", label: "Cancelled" },
];

// Delivery Challan status options
export const deliveryChallanStatusOptions = [
	{
		value: "ACTIVE",
		label: "Active",
		color: "success",
		get icon() { return getFormIcon("active"); },
	},
	{
		value: "CONVERTED",
		label: "Converted",
		color: "info",
		get icon() { return getFormIcon("converted"); },
	},
	{
		value: "CANCELLED",
		label: "Cancelled",
		color: "error",
		get icon() { return getFormIcon("cancelled"); },
	},
];

// Available icons for role selection
export const ROLE_ICONS = [
	{ value: "mdi:account-circle", label: "Default User", category: "General" },
	{ value: "mdi:crown", label: "Crown (Owner/CEO)", category: "Leadership" },
	{
		value: "mdi:shield-crown",
		label: "Shield Crown (Admin)",
		category: "Leadership",
	},
	{
		value: "mdi:account-tie",
		label: "Manager/Executive",
		category: "Management",
	},
	{
		value: "mdi:account-supervisor",
		label: "Supervisor",
		category: "Management",
	},
	{ value: "mdi:briefcase", label: "Business", category: "Management" },
	{ value: "mdi:code-tags", label: "Developer", category: "Technical" },
	{ value: "mdi:laptop", label: "IT/Tech", category: "Technical" },
	{ value: "mdi:database", label: "Database Admin", category: "Technical" },
	{ value: "mdi:palette", label: "Designer", category: "Creative" },
	{ value: "mdi:brush", label: "Artist/Creative", category: "Creative" },
	{ value: "mdi:camera", label: "Photographer", category: "Creative" },
	{ value: "mdi:chart-line", label: "Sales/Marketing", category: "Business" },
	{
		value: "mdi:calculator",
		label: "Finance/Accounting",
		category: "Business",
	},
	{ value: "mdi:chart-bar", label: "Analytics", category: "Business" },
	{ value: "mdi:headset", label: "Support", category: "Service" },
	{ value: "mdi:phone", label: "Customer Service", category: "Service" },
	{ value: "mdi:lifebuoy", label: "Help Desk", category: "Service" },
	{ value: "mdi:account-group", label: "HR/People", category: "HR" },
	{ value: "mdi:handshake", label: "Relations", category: "HR" },
	{ value: "mdi:school", label: "Training", category: "HR" },
	{ value: "mdi:pencil", label: "Editor/Writer", category: "Content" },
	{ value: "mdi:book-open", label: "Content Manager", category: "Content" },
	{ value: "mdi:newspaper", label: "Publisher", category: "Content" },
	{ value: "mdi:eye", label: "Viewer/Guest", category: "Access" },
	{ value: "mdi:lock", label: "Restricted", category: "Access" },
	{ value: "mdi:key", label: "Key Holder", category: "Access" },
];

// Customer statistics configuration for overview cards
export const customerStatsConfig = [
	{
		key: "totalAmount",
		title: "Total Amount",
		subtitle: "Total Invoiced",
		avatarIcon: "ri:money-dollar-circle-line",
		color: "success",
		iconSize: "30px",
	},
	{
		key: "paidAmount",
		title: "Paid Amount",
		subtitle: "Total Paid",
		avatarIcon: "ri:check-double-line",
		color: "info",
		iconSize: "30px",
	},
	{
		key: "outstandingAmount",
		title: "Outstanding",
		subtitle: "Amount Due",
		avatarIcon: "ri:time-line",
		color: "warning",
		iconSize: "30px",
	},
	{
		key: "overdueAmount",
		title: "Overdue",
		subtitle: "Past Due",
		avatarIcon: "ri:alarm-warning-line",
		color: "error",
		iconSize: "30px",
	},
	{
		key: "draftAmount",
		title: "Draft",
		subtitle: "Draft Invoices",
		avatarIcon: "ri:draft-line",
		color: "secondary",
		iconSize: "30px",
	},
	{
		key: "cancelledAmount",
		title: "Cancelled",
		subtitle: "Cancelled Invoices",
		avatarIcon: "ri:close-circle-line",
		color: "default",
		iconSize: "30px",
	},
];

// Action buttons configuration for consistent usage across lists
export const actionButtons = [
	{
		id: "view",
		label: "View",
		icon: "line-md:watch",
		color: "primary",
		title: "View Details",
	},
	{
		id: "edit",
		label: "Edit",
		icon: "line-md:edit",
		color: "primary",
		title: "Edit Item",
	},
	{
		id: "delete",
		label: "Delete",
		icon: "line-md:close-circle",
		color: "error",
		title: "Delete Item",
	},
	{
		id: "clone",
		label: "Clone",
		icon: "mdi:content-duplicate",
		color: "default",
		title: "Clone Item",
	},
	{
		id: "send",
		label: "Send",
		icon: "mdi:invoice-send-outline",
		color: "default",
		title: "Send Item",
	},
	{
		id: "print",
		label: "Print & Download",
		icon: "mdi:printer-outline",
		color: "default",
		title: "Print & Download",
	},
	{
		id: "activate",
		label: "Activate",
		icon: "mdi:account-check-outline",
		color: "success",
		title: "Activate Item",
	},
	{
		id: "deactivate",
		label: "Deactivate",
		icon: "mdi:account-off-outline",
		color: "warning",
		title: "Deactivate Item",
	},
];

export const taxTypes = [
	{ value: "1", label: "Percentage", get icon() { return getFormIcon("1"); } },
	{ value: "2", label: "Fixed", get icon() { return getFormIcon("fixed"); } },
];

export const formIcons = [
	{ value: "category", label: "category", icon: "mdi:category-outline" },
	{ value: "unit", label: "Unit", icon: "uil:ruler" },
	{ value: "service", label: "service", icon: "mdi:room-service-outline" },
	{ value: "product", label: "product", icon: "mdi:shopping-outline" },
	{ value: "barcode", label: "barcode", icon: "mdi:barcode-scan" },
	{ value: "currency", label: "currency", icon: "lucide:saudi-riyal" },
	{ value: "alertQuantity", label: "alertQuantity", icon: "mdi:gauge-low" },
	{ value: "3", label: "fixedDiscount", icon: "lucide:saudi-riyal" },
	{ value: "2", label: "percentageDiscount", icon: "lucide:percent" },
	{ value: "vat", label: "vat", icon: "heroicons-outline:receipt-tax" },
	// Additional icons for expenses and payments
	{ value: "id", label: "id", icon: "mdi:identifier" },
	{ value: "reference", label: "reference", icon: "mdi:text-box-outline" },
	{ value: "payment", label: "payment", icon: "mdi:credit-card-outline" },
	{ value: "date", label: "date", icon: "mdi:calendar-outline" },
	{ value: "status", label: "status", icon: "mdi:check-circle-outline" },
	{ value: "customer", label: "customer", icon: "mdi:account-outline" },
	{ value: "invoice", label: "invoice", icon: "mdi:file-document-outline" },
	// Status icons
	{ value: "refund", label: "refund", icon: "ri:refund-line" },
	{ value: "sent", label: "sent", icon: "ri:send-plane-line" },
	{ value: "unpaid", label: "unpaid", icon: "ri:time-line" },
	{ value: "partiallyPaid", label: "partiallyPaid", icon: "mdi:invoice-text-clock-outline" },
	{ value: "cancelled", label: "cancelled", icon: "ri:close-circle-line" },
	{ value: "overdue", label: "overdue", icon: "mdi:invoice-text-clock-outline" },
	{ value: "paid", label: "paid", icon: "mdi:invoice-text-check-outline" },
	{ value: "drafted", label: "drafted", icon: "mdi:invoice-text-edit-outline" },
	{ value: "active", label: "active", icon: "ri:check-double-line" },
	{ value: "accepted", label: "accepted", icon: "ri:check-double-line" },
	{ value: "expired", label: "expired", icon: "ri:time-line" },
	{ value: "rejected", label: "rejected", icon: "ri:close-circle-line" },
	{ value: "converted", label: "converted", icon: "mdi:invoice-text-check-outline" },
	// Payment method icons
	{ value: "cash", label: "cash", icon: "mdi:cash-multiple" },
	{ value: "cheque", label: "cheque", icon: "mdi:checkbook" },
	{ value: "bank", label: "bank", icon: "mdi:bank" },
	{ value: "online", label: "online", icon: "mdi:web" },
	{ value: "creditCard", label: "creditCard", icon: "bi:credit-card" },
	// Tax type icons
	{ value: "1", label: "percentage", icon: "lucide:percent" },
	{ value: "fixed", label: "fixed", icon: "lucide:saudi-riyal" },
	// User dialog icons
	{ value: "accountDetails", label: "accountDetails", icon: "mdi:account-details" },
	{ value: "account", label: "account", icon: "mdi:account" },
	{ value: "at", label: "at", icon: "mdi:at" },
	{ value: "email", label: "email", icon: "mdi:email" },
	{ value: "phone", label: "phone", icon: "mdi:phone" },
	{ value: "genderMaleFemale", label: "genderMaleFemale", icon: "mdi:gender-male-female" },
	{ value: "shieldAccount", label: "shieldAccount", icon: "mdi:shield-account" },
	{ value: "checkCircle", label: "checkCircle", icon: "mdi:check-circle-outline" },
	{ value: "cakeVariant", label: "cakeVariant", icon: "mdi:cake-variant" },
	{ value: "calendarPlus", label: "calendarPlus", icon: "mdi:calendar-plus" },
	{ value: "update", label: "update", icon: "mdi:update" },
	{ value: "mapMarker", label: "mapMarker", icon: "mdi:map-marker" },
	{ value: "close", label: "close", icon: "mdi:close" },
];

// Helper function to get icon from formIcons array
export const getFormIcon = (value) => {
	const iconData = formIcons.find((item) => item.value === value);
	return iconData?.icon || null;
};

// User session status configurations for status indicator
export const userSessionStatusOptions = [
	{
		key: "loading",
		label: "Loading...",
		color: "var(--mui-palette-grey-400)",
		description: "Session is being loaded",
	},
	{
		key: "offline",
		label: "Offline",
		color: "var(--mui-palette-grey-500)",
		description: "User is not authenticated or no session",
	},
	{
		key: "expired",
		label: "Session Expired",
		color: "var(--mui-palette-grey-500)",
		description: "Session token has expired",
	},
	{
		key: "invalid",
		label: "Invalid Session",
		color: "var(--mui-palette-grey-500)",
		description: "Session token is malformed or invalid",
	},
	{
		key: "expiring",
		label: "Session Expiring Soon",
		color: "var(--mui-palette-warning-main)",
		description: "Session will expire within warning threshold",
	},
	{
		key: "active",
		label: "Online",
		color: "var(--mui-palette-success-main)",
		description: "User has active, valid session",
	},
];

// Session configuration constants
export const sessionConfig = {
	// Session duration: 24 hours (backend JWT + frontend NextAuth aligned)
	// Session expiry warning threshold (30 minutes in seconds)
	expiryWarningThreshold: 1800,

	// Status badge styling
	badgeSize: {
		width: 8,
		height: 8,
	},

	// Session checking intervals (if needed for future enhancements)
	checkIntervals: {
		minimal: 60000, // 1 minute
		moderate: 30000, // 30 seconds
		frequent: 15000, // 15 seconds
	},

	// Countdown timer styling and thresholds
	countdownTimer: {
		updateInterval: 1000, // 1 second
		warningThreshold: 5, // Show warning when less than 5 minutes
		colors: {
			normal: "text-success",
			warning: "text-warning", // Less than 5 minutes
			expired: "text-error",
		},
		background:
			"bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
	},
};

// User related constants
export const userStatusOptions = [
	{ value: "Active", label: "Active", color: "success" },
	{ value: "Inactive", label: "Inactive", color: "error" },
];

export const userTabs = [
	{ value: "ALL", label: "All" },
	{ value: "Active", label: "Active" },
	{ value: "Inactive", label: "Inactive" },
];

export const userTableColumns = [
	{ id: "name", label: "User Name", sortable: true, visible: true },
	{ id: "email", label: "Email", sortable: true, visible: true },
	{ id: "phone", label: "Phone", sortable: false, visible: true },
	{ id: "role", label: "Role", sortable: true, visible: true },
	{ id: "status", label: "Status", sortable: true, visible: true },
	{ id: "createdAt", label: "Created Date", sortable: true, visible: false },
	{ id: "actions", label: "Actions", sortable: false, visible: true },
];

// User filter options
export const userFilterOptions = {
	roles: [
		{ value: "Adminss", label: "Admin" },
		{ value: "Super Admin", label: "Super Admin" },
		{ value: "admin", label: "Admin" },
		{ value: "manager", label: "Manager" },
		{ value: "user", label: "User" },
		{ value: "accountant", label: "Accountant" },
		{ value: "developer", label: "Developer" },
		{ value: "guest", label: "Guest" },
	],
	statuses: [
		{ value: "Active", label: "Active" },
		{ value: "Inactive", label: "Inactive" },
	],
};

// User form validation constants
export const userValidationRules = {
	firstName: {
		required: "First name is required",
		minLength: { value: 2, message: "First name must be at least 2 characters" },
		maxLength: { value: 50, message: "First name must not exceed 50 characters" },
	},
	lastName: {
		required: "Last name is required",
		minLength: { value: 2, message: "Last name must be at least 2 characters" },
		maxLength: { value: 50, message: "Last name must not exceed 50 characters" },
	},
	userName: {
		required: "Username is required",
		minLength: { value: 3, message: "Username must be at least 3 characters" },
		maxLength: { value: 30, message: "Username must not exceed 30 characters" },
		pattern: {
			value: /^[a-zA-Z0-9_]+$/,
			message: "Username can only contain letters, numbers, and underscores",
		},
	},
	email: {
		required: "Email is required",
		pattern: {
			value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			message: "Please enter a valid email address",
		},
	},
	mobileNumber: {
		pattern: {
			value: /^[\+]?[0-9\-\(\)\s]+$/,
			message: "Please enter a valid phone number",
		},
	},
	password: {
		required: "Password is required",
		minLength: { value: 8, message: "Password must be at least 8 characters" },
		pattern: {
			value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
			message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
		},
	},
	role: {
		required: "Role is required",
	},
	status: {
		required: "Status is required",
	},
};