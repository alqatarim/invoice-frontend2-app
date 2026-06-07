'use client';

import { useMemo } from 'react';

import {
	Box,
	Card,
	CardContent,
	Chip,
	IconButton,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion, useReducedMotion } from 'framer-motion';

import { DEFAULT_VIBRANT_SHAPES, VibrantHeader } from '@/components/backgrounds';
import CustomDatePicker from '@/components/datePicker/CustomDatePicker';
import { dashboardEasing } from '@/data/dataSets';
import { RiyalIcon } from '@/utils/currencyUtils';
import { formatCompactNumber, formatWholeNumber } from '@/utils/numberUtils';

import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';

const getPulseAccent = (theme, colorKey, isDark) => {
	const palette = theme.palette[colorKey] || theme.palette.primary;

	if (isDark) return palette.darker || palette.dark || palette.main;

	return palette.dark || palette.main;
};

const getMetricSparkColor = (theme, colorKey, isDark) => {
	const palette = theme.palette[colorKey] || theme.palette.primary;

	if (isDark) return palette.dark || palette.main;

	return palette.main;
};

const KpiRibbonItem = ({ metric, delay = 0 }) => {
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
	const accent = getMetricSparkColor(theme, metric.color, isDark);
	const trendColor =
		metric.direction === 'positive'
			? getPulseAccent(theme, 'success', isDark)
			: metric.direction === 'negative'
				? getPulseAccent(theme, 'error', isDark)
				: theme.palette.text.secondary;
	const trendIcon =
		metric.direction === 'positive'
			? 'ri-arrow-up-line'
			: metric.direction === 'negative'
				? 'ri-arrow-down-line'
				: 'ri-subtract-line';
	const formatter = metric.showRiyalIcon ? formatCompactNumber : formatWholeNumber;
	const hasSpark = Array.isArray(metric.spark) && metric.spark.length > 1;
	const subLabel = metric.subTitle || metric.subtitle || '';

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: dashboardEasing, delay }}
			sx={{
				minWidth: 0,
				height: '100%',
			}}
		>
			<Box
				sx={{
					height: '100%',
					minHeight: { xs: 124, sm: 116 },
					p: { xs: 1.4, md: 1.2 },
				}}
			>
				<Stack spacing={3} sx={{ height: '100%', minWidth: 0 }}>
					<Stack spacing={0.55} sx={{ minWidth: 0 }}>
						<Stack direction="row" alignItems="center" spacing={0.9}>


							{/* <Icon icon={metric.icon} width="0.9rem" style={{ color: accent }} /> */}

							<Typography
								variant="overline"
								color='text.secondary'
								className='tracking-[0.8px] text-[0.75rem] uppercase font-bold'

							>

								{metric.title}
							</Typography>
						</Stack>

					</Stack>

					<Stack spacing={0.5} sx={{ mt: 'auto', minWidth: 0 }}>
						<Stack direction="column" alignItems="start" spacing={0.45}>
							<Stack direction="row" alignItems="baseline" spacing={0.45}>
								{metric.showRiyalIcon ? (
									<RiyalIcon width="0.8rem" color={theme.vars.palette.text.primary} />
								) : null}

								<Typography
									sx={{
										fontSize: '1.65rem',
										fontWeight: 800,
										lineHeight: 1.05,
										letterSpacing: '-0.02em',
										color: 'text.primary',
										fontVariantNumeric: 'tabular-nums',
									}}
								>
									<CountUp value={metric.rawValue} formatter={formatter} />
								</Typography>

							</Stack>


							{subLabel ? (

								<Stack direction="row" alignItems="center" spacing={0.2}>
									<Box
										sx={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 0.28,
											px: 0.85,
											py: 0.35,
											borderRadius: 999,
											color: trendColor,
											flexShrink: 0,
										}}
									>
										<Icon icon={trendIcon} width="0.75rem" />
										<Typography variant="caption" color={trendColor} sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
											{metric.changeNumber}
										</Typography>
									</Box>
									<Typography
										variant="caption"
										sx={{
											color: 'text.secondary',
											fontSize: '0.72rem',
											lineHeight: 1.35,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{subLabel}
									</Typography>
								</Stack>
							) : null}



						</Stack>

						<Stack
							direction="row"
							alignItems="center"
							spacing={0.8}
							sx={{ minHeight: 30, minWidth: 0 }}
						>

							{hasSpark ? (
								<Box
									sx={{
										flex: '1 1 78px',
										minWidth: 68,
										maxWidth: 120,
										height: 30,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Sparkline
										values={metric.spark || []}
										color={accent}
										width={120}
										height={26}
										strokeWidth={1.8}
									/>
								</Box>
							) : null}
						</Stack>
					</Stack>
				</Stack>
			</Box>
		</Box >
	);
};

export const BusinessPulse = ({
	netIncome = 0,
	netMargin = 0,
	netDirection = 'neutral',
	salesAmount = 0,
	periodLabel = 'All Time',
	hasActivePeriod = false,
	isRefreshing = false,
	isAiActive = false,
	metricCards = [],
	draftFromDate = '',
	draftToDate = '',
	onApplyDateRange = async () => false,
	onResetDateRange = async () => { },
	onRefresh = () => { },
	backgroundShapes = DEFAULT_VIBRANT_SHAPES,
}) => {
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
	const prefersReducedMotion = useReducedMotion();

	const positiveColor = getPulseAccent(theme, 'success', isDark);
	const negativeColor = getPulseAccent(theme, 'error', isDark);
	const netColor =
		netDirection === 'positive'
			? positiveColor
			: netDirection === 'negative'
				? negativeColor
				: getPulseAccent(theme, 'info', isDark);
	const netSign = netIncome > 0 ? '+' : netIncome < 0 ? '−' : '';
	const absoluteNet = Math.abs(netIncome);
	const pulseCopy = useMemo(() => {
		if (netDirection === 'positive') {
			return {
				title: 'Positive cash flow',
				description: 'Sales are comfortably covering current purchases and expenses.',
			};
		}

		if (netDirection === 'negative') {
			return {
				title: 'Margin pressure',
				description: 'Current costs are running ahead of collected sales in this period.',
			};
		}

		return {
			title: 'Balanced flow',
			description: 'Sales and costs are sitting fairly close to each other right now.',
		};
	}, [netDirection]);

	return (
		<Card
			component={motion.div}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: dashboardEasing }}
			sx={{
				position: 'relative',
				overflow: 'hidden',
				borderRadius: 3.5,
				backgroundColor: 'background.paper',
				border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.16 : 0.08)}`,
				mb: { xs: 2, md: 3 },
				backgroundImage: isDark
					? `linear-gradient(135deg, ${(theme.vars?.palette?.primary || theme.palette.primary).lighterOpacity} 0%, ${(theme.vars?.palette?.primary || theme.palette.primary).lightestOpacity} 48%, ${(theme.vars?.palette?.info || theme.palette.info).lightestOpacity} 100%)`
					: `linear-gradient(135deg, ${alpha(
						theme.palette.primary.main,
						0.09
					)} 0%, ${alpha(theme.palette.background.paper, 0)} 58%)`,
			}}
		>
			<VibrantHeader
				isDark={isDark}
				animate={!prefersReducedMotion}
				shapes={backgroundShapes}
			/>

			<CardContent
				sx={{
					position: 'relative',
					zIndex: 1,
					p: { xs: 3, md: 4 },
				}}
			>
				<Stack spacing={3.2}>
					<Stack
						direction={{ xs: 'column', lg: 'row' }}
						justifyContent="space-between"
						alignItems={{ xs: 'flex-start', lg: 'flex-start' }}
						spacing={2}
					>

						<Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
							<Box
								sx={{
									position: 'relative',
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 14,
									height: 14,
								}}
							>
								{!prefersReducedMotion ? (
									<Box
										component={motion.span}
										animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
										transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
										sx={{
											position: 'absolute',
											width: '100%',
											height: '100%',
											borderRadius: '50%',
											backgroundColor: netColor,
										}}
									/>
								) : null}
								<Box
									sx={{
										width: 11,
										height: 11,
										borderRadius: '50%',
										backgroundColor: netColor,
									}}
								/>
							</Box>
							<Typography
								variant="h6"
								className='tracking-[1px] uppercase'
								sx={{
									fontWeight: 800,
									// fontSize: '0.8rem',
									// letterSpacing: 1.2,
									// lineHeight: 0,
									// color: alpha(theme.palette.text.primary, isDark ? 0.92 : 0.75),
								}}
							>
								Business Pulse
							</Typography>
							{isAiActive ? (
								<Chip
									size="small"
									icon={
										<Box
											component={motion.span}
											animate={
												prefersReducedMotion ? undefined : { opacity: [0.65, 1, 0.65] }
											}
											transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
											sx={{ display: 'inline-flex' }}
										>
											<Icon icon="ri-sparkling-2-line" width="0.82rem" />
										</Box>
									}
									label="AI active"
									sx={{
										height: 24,
										backgroundColor: alpha(
											isDark ? theme.palette.primary.dark : theme.palette.primary.main,
											0.12
										),
										color: isDark ? theme.palette.primary.dark : theme.palette.primary.main,
										'& .MuiChip-icon': { color: 'inherit' },
										'& .MuiChip-label': { fontWeight: 700, px: 0.8 },
									}}
								/>
							) : null}
						</Stack>
						{/* <Typography variant="body2" color="text.secondary">
								{hasActivePeriod ? `${periodLabel} snapshot` : 'A calm view of current business flow'}
							</Typography> */}


						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems="center">
							<Box sx={{ width: { xs: 200, sm: 240 } }}>
								<CustomDatePicker
									mode="range"
									commitOnApply
									startDate={draftFromDate}
									endDate={draftToDate}
									onApply={onApplyDateRange}
									onReset={onResetDateRange}
									hasActiveSelection={hasActivePeriod}
									emptyLabel={hasActivePeriod ? periodLabel : 'All Time'}
									disabled={isRefreshing}
									popperPlacement="bottom-end"
									portalId="business-pulse-datepicker-portal"
									label="Date Range"
								/>
							</Box>
							<Tooltip title="Refresh">
								<span>
									<IconButton
										onClick={onRefresh}
										disabled={isRefreshing}
										sx={{
											border: `1px solid ${alpha(theme.palette.text.primary, 0.18)}`,
											borderRadius: 1.8,
											width: 40,
											height: 40,
											// backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.6 : 1),
											backdropFilter: 'blur(6px)',
											'&:hover': {
												borderColor: alpha(theme.palette.primary.main, 0.5),
												backgroundColor: alpha(
													theme.palette.background.paper,
													isDark ? 0.85 : 1
												),
											},
										}}
									>
										<motion.div
											animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
											transition={
												isRefreshing
													? { duration: 0.9, repeat: Infinity, ease: 'linear' }
													: { duration: 0.3 }
											}
											style={{ display: 'inline-flex' }}
										>
											<Icon icon="ri-refresh-line" width="1.1rem" />
										</motion.div>
									</IconButton>
								</span>
							</Tooltip>
						</Stack>
					</Stack>

					<Stack
						direction={{ xs: 'column', lg: 'row' }}
						spacing={{ xs: 3, lg: 8, xl: 10 }}
						alignItems={{ xs: 'stretch', lg: 'stretch' }}
					>
						<Box sx={{ flex: { xs: '1 1 auto', lg: '0 0 auto' }, minWidth: 0 }}>
							<Typography
								variant="overline"
								color='text.secondary'
								className='tracking-[0.5px] uppercase font-bold'

							>
								Net income
							</Typography>
							<Stack direction="row" alignItems="baseline" spacing={0} sx={{ mt: 0.8 }}>
								<Typography
									component="span"
									sx={{
										fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
										fontWeight: 900,
										lineHeight: 0.95,
										letterSpacing: '0.03em',
										color: netColor,
										fontVariantNumeric: 'tabular-nums',
									}}
								>
									<Box component="span" sx={{ mr: 1.5 }}>
										{netSign}
									</Box>
									<RiyalIcon width="0.5em" color={netColor} />
									<CountUp value={absoluteNet} formatter={formatCompactNumber} />
								</Typography>
							</Stack>
							{/* <Stack
								direction="row"
								spacing={1}
								alignItems="center"
								sx={{ mt: 1.6 }}
								flexWrap="wrap"
								useFlexGap
							>
								<Box
									sx={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 0.4,
										px: 1,
										py: 0.45,
										borderRadius: 999,
										backgroundColor: alpha(netColor, 0.12),
										color: netColor,
									}}
								>
									<Icon
										icon={
											netDirection === 'positive'
												? 'ri-trending-up-line'
												: netDirection === 'negative'
													? 'ri-trending-down-line'
													: 'ri-subtract-line'
										}
										width="0.9rem"
									/>
									<Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>
										{netMargin >= 0 ? '+' : ''}
										{netMargin.toFixed(1)}% margin
									</Typography>
								</Box>
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									on{' '}
									<Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
										<RiyalIcon width="0.7em" color={theme.palette.text.primary} />{' '}
										<CountUp value={salesAmount} formatter={formatCompactNumber} />
									</Box>{' '}
									sales
								</Typography>
							</Stack> */}
							{/* <Box
								sx={{
									mt: 2.1,
									p: 1.8,
									borderRadius: 2.5,
									backgroundColor: alpha(netColor, isDark ? 0.16 : 0.08),
									border: `1px solid ${alpha(netColor, isDark ? 0.24 : 0.16)}`,
								}}
							>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: netColor }}>
									{pulseCopy.title}
								</Typography>
								<Typography
									variant="body2"
									sx={{ mt: 0.45, color: 'text.secondary', lineHeight: 1.6 }}
								>
									{pulseCopy.description}
								</Typography>
							</Box> */}
						</Box>

						<Box
							sx={{
								flex: 1,
								minWidth: 0,
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
								gap: 5,
							}}
						>
							{metricCards.map((metric, index) => (
								<KpiRibbonItem key={metric.key} metric={metric} delay={0.15 + index * 0.06} />
							))}
						</Box>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
};
