"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic imports for better code splitting
const SalesOverview = dynamic(() => import("@views/charts/SalesOverview"), {
	loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
});

// Lazy load heavy components
const HorizontalWithSubtitle = dynamic(
	() => import("@components/card-statistics/HorizontalWithSubtitle2"),
	{
		loading: () => (
			<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
		),
	}
);
const CardStatWithImage = dynamic(
	() => import("@components/card-statistics/Character"),
	{
		loading: () => (
			<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
		),
	}
);

// Group MUI imports to reduce bundle size
import {
	Table,
	TableHead,
	TableRow,
	TableBody,
	TableCell,
	Button,
	Chip,
	Box,
	Card,
	CardContent,
	CardHeader,
	Grid,
	Typography,
	Avatar,
} from "@mui/material";
import { alpha, useTheme } from '@mui/material/styles';
import OptionMenu from "@core/components/option-menu";
// Dynamic imports for icons to reduce initial bundle size
import SendIcon from "@mui/icons-material/Send";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import RefundIcon from "@mui/icons-material/MonetizationOn";
import ViewIcon from "@mui/icons-material/ViewCarouselOutlined";

import { amountFormat } from "@/utils/numberUtils";
import { convertFirstLetterToCapital } from "@/utils/string";
import { successToast } from "@/core/Toast/toast";
import moment from "moment";
import {
	getDashboardData,
	getFilteredDashboardData,
	convertToSalesReturn,
	sendInvoice,
	cloneInvoice,
} from "@/app/(dashboard)/actions";
import AppSnackbar from "@/components/shared/AppSnackbar";

const Dashboard = ({ initialDashboardData = null }) => {

	const theme = useTheme();

	const [dashboardData, setDashboardData] = useState(initialDashboardData || {});
	const [filterValue, setFilterValue] = useState("month");
	const [invoiceData, setInvoiceData] = useState(initialDashboardData?.invoiceList || []);
	const [currencyData, setCurrencyData] = useState("SAR");
	const [openSnackbar, setOpenSnackbar] = useState({
		open: false,
		message: "",
		type: "",
	});

	// Memoized fetch function to prevent unnecessary re-renders
	const fetchDashboardData = useCallback(async (filter = "") => {
		try {
			const response = filter
				? await getFilteredDashboardData(filter)
				: await getDashboardData();

			if (response.code === 200) {
				setDashboardData(response.data);
				// Only set invoice data if it's the initial load (no filter)
				if (!filter) {
					setInvoiceData(response.data?.invoiceList || []);
				}
			} else {
				setOpenSnackbar({
					open: true,
					message: `Failed to fetch ${filter ? "filtered " : ""}dashboard data`,
					type: "error",
				});
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.error("Error fetching dashboard data:", error);
			}
			setOpenSnackbar({
				open: true,
				message: `Failed to fetch ${filter ? "filtered " : ""}dashboard data`,
				type: "error",
			});
		}
	}, []);

	// Handle filter changes
	const getDetails = async (filter = "") => {
		if (filterValue !== filter) {
			setFilterValue(filter);
			await fetchDashboardData(filter);
		}
	};

	// Handle converting invoice to sales return
	const handleConvertToSalesReturn = async (id) => {
		try {
			const response = await convertToSalesReturn(id);
			if (response.code === 200) {
				successToast("Invoice converted to sales return.");
			} else {
				setOpenSnackbar({
					open: true,
					message: "Failed to convert to sales return",
					type: "error",
				});
			}
		} catch (error) {
			console.error("Error converting to sales return:", error);
			setOpenSnackbar({
				open: true,
				message: "Error converting to sales return",
				type: "error",
			});
		}
	};

	// Handle sending invoice via email
	const handleSendInvoice = async (id) => {
		try {
			const response = await sendInvoice(id);
			if (response.code === 200) {
				successToast("Invoice Mail sent Successfully.");
			} else {
				setOpenSnackbar({
					open: true,
					message: "Failed to send invoice",
					type: "error",
				});
			}
		} catch (error) {
			console.error("Error sending invoice:", error);
			setOpenSnackbar({
				open: true,
				message: "Error sending invoice",
				type: "error",
			});
		}
	};

	// Close the Snackbar
	const handleSnackbarClose = () => {
		setOpenSnackbar({ open: false, message: "", type: "" });
	};

	// Handle cloning an invoice
	const handleCloneInvoice = async (id) => {
		try {
			const response = await cloneInvoice(id);
			if (response.code === 200) {
				successToast("Invoice Cloned Successfully.");
				setInvoiceData((prev) => [response.data, ...prev]);
			} else {
				setOpenSnackbar({
					open: true,
					message: "Failed to clone invoice",
					type: "error",
				});
			}
		} catch (error) {
			console.error("Error cloning invoice:", error);
			setOpenSnackbar({
				open: true,
				message: "Error cloning invoice",
				type: "error",
			});
		}
	};

	// Helper function to get the appropriate badge based on invoice status
	const getStatusBadge = (status) => {
		let color;
		switch (status) {
			case "REFUND":
			case "SENT":
				color = "info";
				break;
			case "UNPAID":
				color = "grey";
				break;
			case "PARTIALLY_PAID":
				color = "primary";
				break;
			case "CANCELLED":
			case "OVERDUE":
				color = "error";
				break;
			case "PAID":
				color = "success";
				break;
			case "DRAFTED":
				color = "warning";
				break;
			default:
				color = "default";
		}

		return (
			<Chip
				label={convertFirstLetterToCapital(status.replace("_", " "))}
				color={color || "default"}
				size="small"
				variant="tonal"
			/>
		);
	};

	// Data for the top statistic cards
	const cardData = [
		{
			title: "Overdue Amount",
			value: dashboardData?.amountDue || 0,
			formattedValue: amountFormat(dashboardData?.amountDue || 0),
			symbol: ` ${currencyData}`,
			avatarIcon: "ri-alarm-warning-line",
			avatarColor: "error",
			// Note: Backend inverts this logic - "Increased" means due amount went DOWN (good)
			// "Decreased" means due amount went UP (bad)
			change:
				dashboardData?.amountDuePercentage?.percentage === "Increased"
					? "positive" // Due amount decreased = good
					: dashboardData?.amountDuePercentage?.percentage === "Decreased"
						? "negative" // Due amount increased = bad
						: "neutral",
			changeNumber: dashboardData?.amountDuePercentage?.value || "0 %",
			subTitle: "since last week",
		},
		{
			title: "Customers",
			value: dashboardData?.customers || 0,
			avatarIcon: "ri-user-add-line",
			avatarColor: "error",
			change:
				dashboardData?.customerPercentage?.percentage === "Increased"
					? "positive"
					: dashboardData?.customerPercentage?.percentage === "Decreased"
						? "negative"
						: "neutral",
			changeNumber: dashboardData?.customerPercentage?.value || "0 %",
			subTitle: "since last week",

			src: "/images/illustrations/characters/14.png",
		},
		{
			title: "Invoices",
			value: dashboardData?.invoices || 0,
			symbol: "",
			avatarIcon: "ri-user-follow-line",
			avatarColor: "success",
			change:
				dashboardData?.invoicedPercentage?.percentage === "Increased"
					? "positive"
					: dashboardData?.invoicedPercentage?.percentage === "Decreased"
						? "negative"
						: "neutral",
			changeNumber: dashboardData?.invoicedPercentage?.value || "0 %",
			subTitle: "since last week",
			src: "/images/illustrations/characters/14.png", // Optional: Provide src if needed
		},
		{
			title: "Estimates",
			value: dashboardData?.estimates || 0,
			avatarIcon: "ri-user-search-line",
			avatarColor: "warning",
			change:
				dashboardData?.quotationPercentage?.percentage === "Increased"
					? "positive"
					: dashboardData?.quotationPercentage?.percentage === "Decreased"
						? "negative"
						: "neutral",
			changeNumber: dashboardData?.quotationPercentage?.value || "0 %",
			subTitle: "since last week",
			src: "/images/illustrations/characters/14.png", // Optional: Provide src if needed
		},
	];

	// Memoized calculations to prevent unnecessary recalculations
	const { totalAmt, progressBars } = useMemo(() => {
		const total =
			(dashboardData?.paidAmt || 0) +
			(dashboardData?.partiallyPaidAmt || 0) +
			(dashboardData?.overdueAmt || 0) +
			(dashboardData?.draftedAmt || 0);

		const bars = [
			{
				label: "Paid",
				value: total ? (dashboardData.paidAmt / total) * 100 : 0,
				color: "success",
			},
			{
				label: "Partially Paid",
				value: total ? (dashboardData.partiallyPaidAmt / total) * 100 : 0,
				color: "warning",
			},
			{
				label: "Overdue",
				value: total ? (dashboardData.overdueAmt / total) * 100 : 0,
				color: "error",
			},
			{
				label: "Drafted",
				value: total ? (dashboardData.draftedAmt / total) * 100 : 0,
				color: "primary",
			},
		];

		return { totalAmt: total, progressBars: bars };
	}, [
		dashboardData?.paidAmt,
		dashboardData?.partiallyPaidAmt,
		dashboardData?.overdueAmt,
		dashboardData?.draftedAmt,
	]);

	return (
		<Grid container spacing={6}>
			{/* Top Statistic Cards */}
			<Grid item size={{ xs: 12, md: 12, lg: 12 }}>
				<Grid
					container
					spacing={6}
					className="flex flex-row justify-between items-end"
				>
					<Grid item size={{ xs: 12, sm: 6, md: 3 }}>
						<CardStatWithImage
							stats={cardData[1].value}
							trend={cardData[1].change}
							title={cardData[1].title}
							trendNumber={cardData[1].changeNumber}
							chipText={cardData[1].subTitle}
							src="/images/illustrations/characters/14.png"
						/>
					</Grid>

					<Grid item size={{ xs: 12, sm: 6, md: 3 }}>
						<HorizontalWithSubtitle
							title={cardData[0].title}
							stats={cardData[0].formattedValue}
							avatarIcon={cardData[0].avatarIcon}
							avatarColor={cardData[0].avatarColor}
							trend={cardData[0].change}
							trendNumber={cardData[0].changeNumber}
							subtitle={cardData[0].subTitle}
							symbol={cardData[0].symbol}
						/>
					</Grid>

					<Grid item size={{ xs: 12, sm: 6, md: 3 }}>
						<HorizontalWithSubtitle
							title={cardData[2].title}
							stats={cardData[2].value}
							avatarIcon={cardData[2].avatarIcon}
							avatarColor={cardData[2].avatarColor}
							trend={cardData[2].change}
							trendNumber={cardData[2].changeNumber}
							subtitle={cardData[2].subTitle}
							symbol={cardData[2].symbol}
						/>
					</Grid>

					<Grid item size={{ xs: 12, sm: 6, md: 3 }}>
						<HorizontalWithSubtitle
							title={cardData[3].title}
							stats={cardData[3].value}
							avatarIcon={cardData[3].avatarIcon}
							avatarColor={cardData[3].avatarColor}
							trend={cardData[3].change}
							trendNumber={cardData[3].changeNumber}
							subtitle={cardData[3].subTitle}
						/>
					</Grid>
				</Grid>
			</Grid>



			{/* Recent Invoices Card */}
			<Grid item size={{ xs: 12, md: 8 }}>
				<Card>
					<CardHeader
						title="Recent Invoices"
						action={
							<Box>
								<Link href="/invoices/invoice-list" passHref>
									<Button
										variant="text"
										size="medium"
										color="primary"
										className="ml-2"
									>
										View All
									</Button>
								</Link>
							</Box>
						}
					/>
					<CardContent className="pb-0">
						<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
							{/* Multi-segment Progress Bar */}
							<Box sx={{ width: "100%" }}>
								<Box
									sx={{
										display: "flex",
										height: "10px",
										borderRadius: "10px",
										overflow: "hidden",
										backgroundColor: "grey.300",
										padding: "0px",
										marginBottom: "13px",
									}}
								>
									{progressBars.map((bar, index) => (
										<Box
											key={index}
											sx={{
												width: `${bar.value}%`,
												backgroundColor: (theme) =>
													theme.palette[bar.color].main,
												transition: "width 0.75s ease-in-out",
											}}
										/>
									))}
								</Box>

								{/* Legend */}
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mt: 1,
									}}
								>
									{progressBars.map((bar, index) => (
										<Box
											key={index}
											sx={{ display: "flex", alignItems: "center", gap: 1 }}
										>
											<Box
												sx={{
													width: "10px",
													height: "10px",
													backgroundColor: (theme) =>
														theme.palette[bar.color].light,
													borderRadius: "50%",
												}}
											/>
											<Typography variant="body1" className="text-[0.85rem]">{bar.label}</Typography>
										</Box>
									))}
								</Box>
							</Box>

							{/* Invoices Table */}
							<Box sx={{ overflowX: "auto", mx: -5 }}>
								<Table size="small">
									<TableHead className="bg-tableHeader">
										<TableRow sx={{ "& th": { fontSize: "14px" } }}>
											<TableCell>Customer</TableCell>
											<TableCell>Amount</TableCell>
											<TableCell>Due Date</TableCell>
											<TableCell>Status</TableCell>
											<TableCell className="text-center">Action</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{invoiceData.map((item, index) => {
											const status = getStatusBadge(item.status);
											return (
												<TableRow
													key={item._id || index}
													sx={{
														"& td": {
															"& .MuiTypography-root": {
																fontSize: "13px",
															},
														},
													}}
												>
													<TableCell>
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																gap: 2,
															}}
														>
															<Avatar
																src={
																	item.customerId?.image ||
																	"/images/default-avatar.png"
																}
																alt={
																	item.customerId?.name ||
																	"Deleted Customer"
																}
															/>
															<Link
																href={`/view-customer/${item.customerId?._id}`}
																passHref
															>
																<Typography sx={{ cursor: "pointer" }}>
																	{item.customerId?.name ||
																		"Deleted Customer"}
																</Typography>
															</Link>
														</Box>
													</TableCell>

													<TableCell>
														<Typography variant="body1" className="text-[0.85rem]">
															{moment(item.dueDate).format("DD MMM YY")}
														</Typography>
													</TableCell>

													<TableCell>
														<Box className="flex items-center gap-0.5">
															<Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
															<Typography className="text-[14px]">
																{amountFormat(item.TotalAmount)}{" "}

															</Typography>
														</Box>
													</TableCell>
													<TableCell>{status}</TableCell>
													<TableCell className="text-center">
														<OptionMenu
															icon="ri-more-fill text-[22px]"
															iconButtonProps={{ size: "small", "aria-label": "invoice actions" }}
															options={[
																{
																	text: "Send Invoice",
																	icon: <SendIcon fontSize="small" />,
																	menuItemProps: {
																		className: "flex items-center gap-2 text-textSecondary",
																		onClick: () => handleSendInvoice(item._id),
																	},
																},
																{
																	text: "Duplicate Invoice",
																	icon: <FileCopyIcon fontSize="small" />,
																	menuItemProps: {
																		className: "flex items-center gap-2 text-textSecondary",
																		onClick: () => handleCloneInvoice(item._id),
																	},
																},
																{
																	text: "Return Invoice",
																	icon: <RefundIcon fontSize="small" />,
																	menuItemProps: {
																		className: "flex items-center gap-2 text-textSecondary",
																		onClick: () => handleConvertToSalesReturn(item._id),
																	},
																},
																{
																	text: "View",
																	icon: <ViewIcon fontSize="small" />,
																	href: `/invoices/invoice-view/${item._id}`,
																	linkProps: {
																		className:
																			"flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary",
																		target: "_blank",
																		rel: "noopener noreferrer",
																	},
																},
															]}
														/>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Grid>

			{/* Invoice Analytics Card */}
			<Grid item size={{ xs: 12, md: 4 }}>
				<SalesOverview
					series={dashboardData.series || []}
					amounts={[
						dashboardData.paidAmt || 0,
						dashboardData.draftedAmt || 0,
						dashboardData.overdueAmt || 0,
						dashboardData.partiallyPaidAmt || 0,
					]}
					currencyData={currencyData}
					labels={dashboardData.labels || []}
					height={250}
					width={250}
				/>
			</Grid>


			<AppSnackbar
				open={openSnackbar.open}
				message={openSnackbar.message}
				severity={openSnackbar.type || "success"}
				onClose={handleSnackbarClose}
				autoHideDuration={6000}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>
		</Grid>
	);
};

export default Dashboard;
