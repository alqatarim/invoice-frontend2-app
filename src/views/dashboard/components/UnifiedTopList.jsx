'use client';

import { useMemo, useState } from 'react';

import {
	Box,
	Card,
	CardContent,
	Stack,
	Tab,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

import CustomAvatar from '@core/components/mui/Avatar';
import CustomTabList from '@core/components/mui/TabList';
import { dashboardEasing, dashboardTopListSections } from '@/data/dataSets';
import { RiyalIcon } from '@/utils/currencyUtils';
import { formatCompactNumber, formatWholeNumber } from '@/utils/numberUtils';

const safeArray = value => (Array.isArray(value) ? value : []);

const UnifiedListRow = ({ item, index, section, accent, isLast, delay = 0 }) => {
	const theme = useTheme();

	const isProducts = section === 'products';
	const isCustomers = section === 'customers';
	const isStock = section === 'stock';
	const name = item?.name || (isCustomers ? 'Customer' : isStock ? 'Product' : 'Item');
	const subtitle = isProducts
		? `${formatWholeNumber(item?.quantitySold || 0)} sold`
		: isCustomers
			? `${formatWholeNumber(item?.invoiceCount || 0)} invoices`
			: `Alert at ${formatWholeNumber(item?.alertQuantity || 0)}`;
	const valueRaw = isStock ? Number(item?.quantity || 0) : Number(item?.revenue || 0);
	const valueLabel = isStock ? `${formatWholeNumber(valueRaw)} left` : formatCompactNumber(valueRaw);
	const showRiyal = !isStock;
	const growth = Number(item?.growthPercentage || 0);
	const isTrending = (isProducts || isCustomers) && Number.isFinite(growth);
	const stockSeverity = isStock ? String(item?.severity || 'warning') : null;
	const stockSeverityColor =
		stockSeverity === 'critical'
			? theme.palette.error.main
			: stockSeverity === 'high'
				? theme.palette.warning.main
				: theme.palette.info.main;
	const productImage =
		isProducts && item?.image ? (
			<Box
				component="img"
				src={item.image}
				alt={typeof name === 'string' ? name : ''}
				sx={{
					width: 32,
					height: 32,
					borderRadius: 1.2,
					objectFit: 'cover',
					flexShrink: 0,
					border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
				}}
			/>
		) : null;
	const dotColor = alpha(theme.palette.text.primary, 0.28);
	const rowAccent = isStock ? stockSeverityColor : accent;

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, x: -6 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.35, ease: dashboardEasing, delay }}
			sx={{
				position: 'relative',
				py: 1.4,
				px: 1,
				borderRadius: 1,
				transition: 'background-color 0.2s ease',
				borderBottom: isLast ? 'none' : `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
				'&:hover': {
					backgroundColor: alpha(rowAccent, 0.05),
					'& .row-rank-pill': {
						backgroundColor: alpha(rowAccent, 0.15),
						color: rowAccent,
					},
					'& .row-leader': {
						opacity: 1,
					},
				},
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
				<Box
					className="row-rank-pill"
					aria-hidden
					sx={{
						minWidth: 26,
						height: 22,
						px: 0.8,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						fontSize: '0.72rem',
						fontWeight: 700,
						letterSpacing: 0.4,
						fontVariantNumeric: 'tabular-nums',
						color: alpha(theme.palette.text.primary, 0.55),
						backgroundColor: alpha(theme.palette.text.primary, 0.05),
						borderRadius: 1,
						transition: 'background-color 0.2s ease, color 0.2s ease',
						userSelect: 'none',
					}}
				>
					{String(index + 1).padStart(2, '0')}
				</Box>

				{productImage}

				<Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: '1 1 auto' }}>
					<Box sx={{ minWidth: 0, flexShrink: 1 }}>
						<Tooltip title={typeof name === 'string' ? name : ''} placement="top" arrow disableInteractive>
							<Typography
								sx={{
									fontSize: '0.9rem',
									fontWeight: 600,
									lineHeight: 1.3,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									display: 'block',
								}}
							>
								{name}
							</Typography>
						</Tooltip>
						<Typography
							variant="caption"
							sx={{
								fontSize: '0.7rem',
								color: 'text.secondary',
								display: 'block',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								lineHeight: 1.2,
							}}
						>
							{subtitle}
						</Typography>
					</Box>

					<Box
						className="row-leader"
						aria-hidden
						sx={{
							flex: '1 1 auto',
							minWidth: 12,
							alignSelf: 'center',
							marginTop: '4px',
							height: '2px',
							backgroundImage: `radial-gradient(circle, ${dotColor} 0.9px, transparent 1.1px)`,
							backgroundSize: '6px 2px',
							backgroundRepeat: 'repeat-x',
							backgroundPosition: 'left center',
							opacity: 0.7,
							transition: 'opacity 0.2s ease',
						}}
					/>

					<Stack
						spacing={0.1}
						sx={{
							alignItems: 'flex-end',
							textAlign: 'right',
							flexShrink: 0,
						}}
					>
						<Stack direction="row" alignItems="center" spacing={0.4}>
							{showRiyal ? (
								<RiyalIcon width="0.78rem" color={theme.palette.text.secondary} />
							) : null}
							<Typography
								sx={{
									fontSize: '0.9rem',
									fontWeight: 700,
									lineHeight: 1.2,
									fontVariantNumeric: 'tabular-nums',
								}}
							>
								{valueLabel}
							</Typography>
						</Stack>
						{isTrending && growth !== 0 ? (
							<Stack direction="row" alignItems="center" spacing={0.2}>
								<Icon
									icon={growth >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}
									width="0.7rem"
									style={{
										color:
											growth >= 0 ? theme.palette.success.main : theme.palette.error.main,
									}}
								/>
								<Typography
									variant="caption"
									sx={{
										fontWeight: 700,
										fontSize: '0.66rem',
										color:
											growth >= 0 ? theme.palette.success.main : theme.palette.error.main,
										fontVariantNumeric: 'tabular-nums',
									}}
								>
									{Math.abs(growth).toFixed(1)}%
								</Typography>
							</Stack>
						) : isStock ? (
							<Typography
								variant="caption"
								sx={{
									fontWeight: 700,
									fontSize: '0.62rem',
									letterSpacing: 0.4,
									textTransform: 'uppercase',
									color: stockSeverityColor,
								}}
							>
								{stockSeverity}
							</Typography>
						) : null}
					</Stack>
				</Stack>
			</Stack>
		</Box>
	);
};

export const UnifiedTopList = ({
	products = [],
	customers = [],
	stockAlerts = [],
	productsTab = 'all',
	customersTab = 'all',
	tabs = [],
	onProductsTabChange = () => { },
	onCustomersTabChange = () => { },
	panelHeight = 295,
	delay = 0,
}) => {
	const theme = useTheme();
	const [activeSectionKey, setActiveSectionKey] = useState('products');

	const activeSection =
		dashboardTopListSections.find(section => section.key === activeSectionKey) || dashboardTopListSections[0];
	const activeSectionAccent =
		theme.palette[activeSection.color]?.main || theme.palette.primary.main;
	const sectionItems = useMemo(
		() => ({
			products: safeArray(products),
			customers: safeArray(customers),
			stock: safeArray(stockAlerts),
		}),
		[customers, products, stockAlerts]
	);

	const subTabs =
		activeSectionKey === 'products' ? tabs : activeSectionKey === 'customers' ? tabs : null;
	const selectedSubTabValue = activeSectionKey === 'products' ? productsTab : customersTab;
	const handleSubTabChange =
		activeSectionKey === 'products' ? onProductsTabChange : onCustomersTabChange;

	const renderSectionRows = sectionKey => {
		const sectionMeta =
			dashboardTopListSections.find(section => section.key === sectionKey) || dashboardTopListSections[0];
		const sectionAccent =
			theme.palette[sectionMeta.color]?.main || theme.palette.primary.main;
		const items = sectionItems[sectionKey] || [];

		return (
			<Stack
				spacing={0}
				sx={{
					flex: 1,
					minHeight: 0,
					overflowY: 'auto',
					mr: -0.5,
					pr: 0.5,
				}}
			>
				{items.length === 0 ? (
					<Box
						sx={{
							py: 6,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 1,
						}}
					>
						<CustomAvatar color="secondary" skin="light" variant="rounded" size={40}>
							<Icon icon="ri-inbox-line" width={20} />
						</CustomAvatar>
						<Typography variant="body2" color="text.secondary">
							No data available.
						</Typography>
					</Box>
				) : (
					items.map((item, index) => (
						<UnifiedListRow
							key={`${sectionKey}-${index}-${item?.productId || item?.customerId || item?.name}`}
							item={item}
							index={index}
							section={sectionKey}
							accent={sectionAccent}
							isLast={index === items.length - 1}
							delay={index * 0.05}
						/>
					))
				)}
			</Stack>
		);
	};

	return (
		<Card
			component={motion.div}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease: dashboardEasing, delay }}
			sx={{
				height: panelHeight,
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<CardContent
				sx={{
					p: { xs: 2.5, md: 3 },
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					minHeight: 0,
				}}
			>
				<TabContext value={activeSectionKey}>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						justifyContent="space-between"
						sx={{ mb: 2.5 }}
					>
						<Stack direction="row" spacing={1} alignItems="center">
							<CustomAvatar color={activeSection.color} skin="light" variant="rounded" size={32}>
								<Icon icon={activeSection.icon} width="1.05rem" />
							</CustomAvatar>
							<Typography variant="h6" sx={{ fontWeight: 600 }}>
								{activeSection.label}
							</Typography>
						</Stack>
						<Stack direction="row" gap={3} alignItems="center">
							{subTabs && subTabs.length > 0 ? (
								<ToggleButtonGroup
									exclusive
									value={selectedSubTabValue}
									onChange={handleSubTabChange}
									size="small"

								// sx={{
								// 	p: 0.4,
								// 	borderRadius: 999,
								// 	border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
								// 	backgroundColor: alpha(theme.palette.action.hover, 0.04),
								// 	'& .MuiToggleButtonGroup-grouped': {
								// 		border: 0,
								// 	},
								// }}
								>
									{subTabs.map(tab => {
										const selected = selectedSubTabValue === tab.value;
										const tabAccent = theme.palette[tab.color]?.main || activeSectionAccent;

										return (
											<ToggleButton
												key={tab.value}
												value={tab.value}
												size="small"
												color={tab.color}
												className='px-2.5 py-1'

											>
												{tab.label}
											</ToggleButton>
										);
									})}
								</ToggleButtonGroup>
							) : null}

							<CustomTabList
								onChange={(_, value) => setActiveSectionKey(value)}
								variant="scrollable"
								scrollButtons="auto"
								allowScrollButtonsMobile
								pill="true"
								color={activeSection.color}
								aria-label="Dashboard top list sections"
								className='min-h-[0]'
							>
								{dashboardTopListSections.map(section => (
									<Tab
										key={section.key}
										value={section.key}
										aria-label={section.label}
										icon={
											<Tooltip title={section.label}>
												<Box sx={{ display: 'inline-flex' }}>
													<Icon icon={section.icon} width="1.1rem" />
												</Box>
											</Tooltip>
										}
										className='min-w-[0] min-h-[0] p-1'
									/>
								))}
							</CustomTabList>
						</Stack>
					</Stack>

					<Box sx={{ flex: 1, minHeight: 0 }}>
						{dashboardTopListSections.map(section => (
							<TabPanel key={section.key} value={section.key} sx={{ p: 0, height: '100%' }}>
								<Box
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										minHeight: 0,
									}}
								>
									{renderSectionRows(section.key)}
								</Box>
							</TabPanel>
						))}
					</Box>
				</TabContext>
			</CardContent>
		</Card>
	);
};
