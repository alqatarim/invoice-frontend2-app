// React Imports
import { useMemo, useCallback } from "react";

// Next Imports
import dynamic from "next/dynamic";

// MUI Imports
import Grid from "@mui/material/Grid";

// Dynamic imports for better performance
const CustomListTable = dynamic(() => import("@/components/custom-components/CustomListTable"), {
	loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
});

const MultiBarProgress = dynamic(() => import("@components/card-statistics/MultiBarProgress"), {
	loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
});

// Static imports
import { getCustomerInvoiceColumns } from "./tableColumns";
import { statusOptions } from "@/data/dataSets";

// Handler Import
import { useOverviewHandlers } from "@/handlers/customers/view";

const CustomerOverview = ({ invoices = [], cardDetails }) => {
	// Handler for overview data management
	const {
		searchValue,
		pagination,
		filteredInvoices,
		// totalAmount,
		handlePageChange,
		handleRowsPerPageChange,
		handleSearchChange,
		getRowKey,
	} = useOverviewHandlers({ invoices, cardDetails });

	// Table columns configuration
	const columns = useMemo(() => getCustomerInvoiceColumns(), []);

	// Memoized status options lookup for better performance
	const statusOptionsMap = useMemo(() => {
		const map = new Map();
		statusOptions.forEach(option => {
			map.set(option.value, option);
		});
		return map;
	}, []);

	// Create stats array for breakdown statistics with optimized lookups
	const breakdownStats = useMemo(
		() => {
			const paidOption = statusOptionsMap.get("PAID");
			const partiallyPaidOption = statusOptionsMap.get("PARTIALLY_PAID");
			const sentOption = statusOptionsMap.get("SENT");
			const draftedOption = statusOptionsMap.get("DRAFTED");
			const overdueOption = statusOptionsMap.get("OVERDUE");
			const cancelledOption = statusOptionsMap.get("CANCELLED");

			return [
				{
					title: "Paid Amount",
					subtitle: "Total Paid",
					titleVariant: "h6",
					subtitleVariant: "body2",
					stats: cardDetails?.paidRecs?.[0]?.amount || 0,
					statsVariant: "h5",
					avatarIcon: paidOption?.icon,
					color: paidOption?.color,
					colorOpacity: "light",
					iconSize: "30px",
					isCurrency: true,
					currencyIconWidth: "1.25rem",
					trendNumber: cardDetails?.paidRecs?.[0]?.count || 0,
				},
			{
				title: "Partially Paid",
				subtitle: "Partial Payments",
				titleVariant: "h6",
				subtitleVariant: "body2",
				stats: cardDetails?.partiallyPaidRecs?.[0]?.amount || 0,
				statsVariant: "h5",
				avatarIcon: partiallyPaidOption?.icon,
				color: partiallyPaidOption?.color,
				colorOpacity: "light",
				iconSize: "30px",
				isCurrency: true,
				currencyIconWidth: "1.25rem",
				trendNumber: cardDetails?.partiallyPaidRecs?.[0]?.count || 0,
			},
			{
				title: "Sent",
				subtitle: "Invoices Sent",
				titleVariant: "h6",
				subtitleVariant: "body2",
				stats: cardDetails?.sentRecs?.[0]?.amount || 0,
				statsVariant: "h5",
				avatarIcon: sentOption?.icon,
				color: sentOption?.color,
				colorOpacity: "light",
				iconSize: "30px",
				isCurrency: true,
				currencyIconWidth: "1.25rem",
				trendNumber: cardDetails?.sentRecs?.[0]?.count || 0,
			},

			{
				title: "Drafted",
				subtitle: "Draft Invoices",
				titleVariant: "h6",
				subtitleVariant: "body2",
				stats: cardDetails?.draftedRecs?.[0]?.amount || 0,
				statsVariant: "h5",
				avatarIcon: draftedOption?.icon,
				color: draftedOption?.color,
				colorOpacity: "light",
				iconSize: "30px",
				isCurrency: true,
				currencyIconWidth: "1.25rem",
				trendNumber: cardDetails?.draftedRecs?.[0]?.count || 0,
			},

			{
				title: "Overdue",
				subtitle: "Past Due",
				titleVariant: "h6",
				subtitleVariant: "body2",
				stats: cardDetails?.overDueRecs?.[0]?.amount || 0,
				statsVariant: "h5",
				avatarIcon: overdueOption?.icon,
				color: overdueOption?.color,
				colorOpacity: "light",
				iconSize: "30px",
				isCurrency: true,
				currencyIconWidth: "1.25rem",
				trendNumber: cardDetails?.overDueRecs?.[0]?.count || 0,
			},

			,
			{
				title: "Cancelled",
				subtitle: "Cancelled Invoices",
				titleVariant: "h6",
				subtitleVariant: "body2",
				stats: cardDetails?.cancelledRecs?.[0]?.amount || 0,
				statsVariant: "h5",
				avatarIcon: cancelledOption?.icon,
				color: cancelledOption?.color,
				colorOpacity: "light",
				iconSize: "30px",
				isCurrency: true,
				currencyIconWidth: "1.25rem",
				trendNumber: cardDetails?.cancelledRecs?.[0]?.count || 0,
			},
		];
		},
		[cardDetails, statusOptionsMap]
	);

	return (
		<Grid container>
			{/* Statistics Cards */}
			<Grid size={{ xs: 12 }} className="">
				<MultiBarProgress
					stats={breakdownStats}
					totalAmount={cardDetails?.totalRecs?.[0]?.amount}
					borderColor="primary"
					height={"130px"}
					barHeight={"40px"}
					width={"100%"}
				/>
			</Grid>

			{/* Recent Invoices Table */}
			<Grid size={{ xs: 12 }}>
				<CustomListTable
					title="Recent Invoices"
					columns={columns}
					rows={filteredInvoices}
					rowKey={getRowKey}
					pagination={pagination}
					onPageChange={handlePageChange}
					onRowsPerPageChange={handleRowsPerPageChange}
					showSearch={true}
					searchValue={searchValue}
					onSearchChange={handleSearchChange}
					noDataText="No invoices found"
					loading={false}
				/>
			</Grid>
		</Grid>
	);
};

export default CustomerOverview;
