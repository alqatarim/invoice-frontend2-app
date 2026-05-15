'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import CustomAvatar from '@core/components/mui/Avatar';
import { statusOptions } from '@/data/dataSets';
import { formatCompactNumber, formatWholeNumber } from '@/utils/numberUtils';
import { RiyalIcon } from '@/utils/currencyUtils';
import { CountUp } from '@/views/dashboard/CountUp';

const STATUS_COLOR_FALLBACK = {
	PAID: 'success',
	DRAFTED: 'secondary',
	OVERDUE: 'error',
	PARTIALLY_PAID: 'warning',
	SENT: 'info',
	UNPAID: 'warning',
	REFUND: 'secondary',
};

const normalizeStatus = (value = '') =>
	String(value).trim().replace(/\s+/g, '_').toUpperCase();

const EASE = [0.22, 1, 0.36, 1];

const InvoicesInsights = ({
	labels = [],
	amounts = [],
	statusCounts = [],
	activeFilterLabel = 'All Time',
}) => {
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';

	const [hoverKey, setHoverKey] = useState(null);

	const statusOptionsMap = useMemo(() => {
		const map = new Map();
		statusOptions.forEach(option => {
			map.set(normalizeStatus(option.value), option);
		});
		return map;
	}, []);

	const statusData = useMemo(() => {
		const defaultLabels =
			labels.length > 0
				? labels
				: ['PAID', 'DRAFTED', 'OVERDUE', 'PARTIALLY_PAID'];

		return defaultLabels.map((status, index) => {
			const normalizedStatus = normalizeStatus(status);
			const foundStatus = statusOptionsMap.get(normalizedStatus);
			const colorKey =
				foundStatus?.color ||
				STATUS_COLOR_FALLBACK[normalizedStatus] ||
				'primary';
			const amount = Number(amounts[index] || 0);
			const muiColor = theme.palette[colorKey] || theme.palette.primary;
			return {
				key: normalizedStatus,
				label: foundStatus?.label || normalizedStatus.replace(/_/g, ' '),
				icon: foundStatus?.icon || 'ri-circle-line',
				color: colorKey,
				accent: muiColor.main,
				amount,
				count: Number(statusCounts[index] || 0),
			};
		});
	}, [labels, amounts, statusCounts, statusOptionsMap, theme.palette]);

	const totalAmount = useMemo(
		() => statusData.reduce((sum, item) => sum + item.amount, 0),
		[statusData]
	);
	const totalCount = useMemo(
		() => statusData.reduce((sum, item) => sum + item.count, 0),
		[statusData]
	);

	const enriched = useMemo(
		() =>
			statusData
				.map(item => ({
					...item,
					share: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
					shareCount: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
				}))
				.sort((a, b) => b.amount - a.amount),
		[statusData, totalAmount, totalCount]
	);

	const hasData = enriched.some(item => item.amount > 0);

	// Pre-compute "leading" segment for the headline insight chip
	const leading = enriched[0];
	const leadingShare = leading?.share || 0;

	const overdueItem = enriched.find(s => s.key === 'OVERDUE');

	return (
		<Card
			component={motion.div}
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
			sx={{ height: '100%' }}
		>
			<CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
				{/* Header */}
				<Stack
					direction="row"
					justifyContent="flex-start"
					alignItems="center"
					spacing={3}
					sx={{ mb: 2 }}
				>
					{/* <Box> */}

					<CustomAvatar color="primary" skin="light" variant="rounded" size={36}>
						<Icon icon="mdi:invoice-text-outline" width="1.4rem" />
					</CustomAvatar>
					<Typography variant="h5" sx={{ fontWeight: 600 }}>
						Invoices Insights
					</Typography>
					{/* <Typography
							variant="caption"
							sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}
						>
							Distribution by amount · {activeFilterLabel}
						</Typography> */}
					{/* </Box> */}

				</Stack>

				{!hasData ? (
					<Box
						sx={{
							minHeight: 320,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 1.5,
							color: 'text.secondary',
						}}
					>
						<Icon icon="ri-donut-chart-line" width="1.5rem" />
						<Typography variant="body2" color="text.secondary">
							No invoice data available for this period.
						</Typography>
					</Box>
				) : (
					<Box className='flex flex-col space-between gap-5'>
						{/* Headline total */}
						<Box>
							<Typography
								variant="caption"
								sx={{
									color: alpha(theme.palette.text.primary, isDark ? 0.85 : 0.65),
									fontWeight: 700,
									textTransform: 'uppercase',
									letterSpacing: 1,
									fontSize: '0.68rem',
								}}
							>
								Total invoiced
							</Typography>
							<Stack direction="row" alignItems="baseline" spacing={0.6} sx={{ mt: 0.4 }}>
								<RiyalIcon width="1.05rem" color={theme.palette.text.primary} />
								<Typography
									sx={{
										fontSize: { xs: '1.9rem', md: '2.2rem' },
										fontWeight: 800,
										lineHeight: 1.1,
										letterSpacing: '-0.02em',
										fontVariantNumeric: 'tabular-nums',
									}}
								>
									<CountUp value={totalAmount} formatter={formatCompactNumber} />
								</Typography>
							</Stack>
							{/* <Typography
								variant="caption"
								sx={{ color: 'text.secondary', display: 'block', mt: 0.4 }}
							>
								across{' '}
								<Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
									<CountUp value={totalCount} formatter={formatWholeNumber} />
								</Box>{' '}
								invoices
							</Typography> */}
						</Box>

						{/* Stacked horizontal bar visualization */}
						<Box>
							<Box
								sx={{
									position: 'relative',
									height: 12,
									borderRadius: 999,
									overflow: 'hidden',
									display: 'flex',
									backgroundColor: alpha(theme.palette.text.primary, 0.05),
									border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
								}}
							>
								{enriched.map((status, index) => {
									if (status.amount <= 0) return null;
									const dimmed = hoverKey && hoverKey !== status.key;
									return (
										// <Tooltip
										// 	key={status.key}
										// 	title={
										// 		<Box sx={{ p: 0.4 }}>
										// 			<Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
										// 				{status.label}
										// 			</Typography>
										// 			<Typography variant="caption" sx={{ display: 'block' }}>
										// 				{formatCompactNumber(status.amount)} SAR · {status.share.toFixed(1)}%
										// 			</Typography>
										// 		</Box>
										// 	}
										// 	arrow
										// 	placement="top"
										// 	disableInteractive
										// >
										<Box
											component={motion.div}
											onMouseEnter={() => setHoverKey(status.key)}
											onMouseLeave={() => setHoverKey(null)}
											initial={{ width: 0 }}
											animate={{ width: `${status.share}%` }}
											transition={{
												duration: 0.9,
												ease: 'easeOut',
												delay: 0.4 + index * 0.06,
											}}
											sx={{
												height: '100%',
												backgroundColor: status.accent,
												opacity: dimmed ? 0.35 : 1,
												transition: 'opacity 0.2s ease',
												cursor: 'pointer',
											}}
										/>
										// </Tooltip>
									);
								})}
							</Box>

							{/* Caption row under the bar */}
							{/* {leading ? (
								<Stack
									direction="row"
									alignItems="center"
									spacing={1}
									sx={{ mt: 1.5 }}
								>
									<Box
										sx={{
											width: 8,
											height: 8,
											borderRadius: '50%',
											backgroundColor: leading.accent,
										}}
									/>
									<Typography variant="caption" sx={{ color: 'text.secondary' }}>
										<Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
											{leading.label}
										</Box>{' '}
										leads with{' '}
										<Box component="span" sx={{ fontWeight: 700, color: leading.accent }}>
											{leadingShare.toFixed(1)}%
										</Box>{' '}
										of value
									</Typography>
								</Stack>
							) : null} */}
						</Box>

						{/* Status ledger */}
						<Box className='flex flex-col space-between gap-2'>
							{enriched.map((status, index) => (
								<StatusLedgerRow
									key={status.key}
									status={status}
									index={index}
									isHovered={hoverKey === status.key}
									isDimmed={hoverKey && hoverKey !== status.key}
									onHover={() => setHoverKey(status.key)}
									onLeave={() => setHoverKey(null)}
								/>
							))}
						</Box>

						{/* Overdue alert (when relevant) */}
						{/* {overdueItem && overdueItem.amount > 0 ? (
							<Box
								component={motion.div}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 0.9 }}
								sx={{
									p: 1.4,
									borderRadius: 1.5,
									border: `1px dashed ${alpha(theme.palette.error.main, 0.4)}`,
									backgroundColor: alpha(theme.palette.error.main, 0.06),
								}}
							>
								<Stack direction="row" spacing={1.2} alignItems="center">
									<Box
										component={motion.span}
										animate={{
											scale: [1, 1.3, 1],
											opacity: [0.6, 1, 0.6],
										}}
										transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
										sx={{
											width: 8,
											height: 8,
											borderRadius: '50%',
											backgroundColor: theme.palette.error.main,
											flexShrink: 0,
										}}
									/>
									<Typography
										variant="caption"
										sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.4 }}
									>
										<Box component="span" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
											{formatCompactNumber(overdueItem.amount)} SAR
										</Box>{' '}
										is overdue across{' '}
										<Box component="span" sx={{ fontWeight: 700 }}>
											{overdueItem.count}
										</Box>{' '}
										invoice{overdueItem.count === 1 ? '' : 's'}
									</Typography>
								</Stack>
							</Box>
						) : null} */}
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

const StatusLedgerRow = ({ status, index, isHovered, isDimmed, onHover, onLeave }) => {
	const theme = useTheme();

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.4, ease: EASE, delay: 0.5 + index * 0.05 }}
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
			sx={{
				cursor: 'pointer',
				p: 1.2,
				borderRadius: 1.5,
				transition: 'background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
				opacity: isDimmed ? 0.55 : 1,
				transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
				backgroundColor: isHovered ? alpha(status.accent, 0.07) : 'transparent',
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				spacing={1.5}
				sx={{ mb: 0.8 }}
			>
				<Stack direction="row" alignItems="center" spacing={2.5} sx={{ minWidth: 0, flex: 1 }}>
					<Box
						sx={{
							width: 10,
							height: 10,
							borderRadius: '50%',
							backgroundColor: status.accent,
							flexShrink: 0,
							boxShadow: isHovered ? `0 0 0 4px ${alpha(status.accent, 0.18)}` : 'none',
							transition: 'box-shadow 0.25s ease',
						}}
					/>
					<Box sx={{ minWidth: 0 }}>
						<Typography
							sx={{
								fontSize: '0.85rem',
								fontWeight: 600,
								lineHeight: 1.2,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{status.label}
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
								fontSize: '0.7rem',
								lineHeight: 1.2,
							}}
						>
							{formatWholeNumber(status.count)} invoice{status.count === 1 ? '' : 's'}
						</Typography>
					</Box>
				</Stack>

				<Stack spacing={0.1} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
					<Stack direction="row" alignItems="center" spacing={0.4}>
						<RiyalIcon width="0.78rem" color={theme.palette.text.secondary} />
						<Typography
							sx={{
								fontSize: '0.85rem',
								fontWeight: 700,
								lineHeight: 1.2,
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{formatCompactNumber(status.amount)}
						</Typography>
					</Stack>
					<Typography
						variant="caption"
						sx={{
							fontWeight: 700,
							fontSize: '0.7rem',
							lineHeight: 1.2,
							color: status.accent,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						{status.share.toFixed(1)}%
					</Typography>
				</Stack>
			</Stack>

			{/* Tiny per-row share bar (only animates in once) */}
			{/* <Box
				sx={{
					height: 4,
					width: '100%',
					borderRadius: 2,
					backgroundColor: alpha(status.accent, 0.12),
					overflow: 'hidden',
				}}
			>
				<Box
					component={motion.div}
					initial={{ width: 0 }}
					animate={{ width: `${Math.min(Math.max(status.share, 0), 100)}%` }}
					transition={{ duration: 0.9, ease: 'easeOut', delay: 0.6 + index * 0.05 }}
					sx={{
						height: '100%',
						backgroundColor: status.accent,
						borderRadius: 2,
					}}
				/>
			</Box> */}
		</Box>
	);
};

export default InvoicesInsights;
