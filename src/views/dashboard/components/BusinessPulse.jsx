'use client';

import dayjs from 'dayjs';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	IconButton,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion, useReducedMotion } from 'framer-motion';

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import { dashboardEasing } from '@/data/dataSets';
import { RiyalIcon } from '@/utils/currencyUtils';
import { formatCompactNumber, formatWholeNumber } from '@/utils/numberUtils';

import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';

const PulseDateInput = forwardRef(function PulseDateInput(
	{ displayValue, value, onClick, ...rest },
	ref
) {
	return (
		<TextField
			fullWidth
			label="Date Range"
			value={displayValue ?? value ?? ''}
			onClick={onClick}
			inputRef={ref}
			{...rest}
		/>
	);
});

const toDateValue = value => {
	const parsed = dayjs(value);

	return parsed.isValid() ? parsed.toDate() : null;
};

const formatDateLabel = (from, to, fallback = 'All Time') => {
	const start = from ? dayjs(from) : null;
	const end = to ? dayjs(to) : null;

	if (start && end) return `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
	if (start) return `${start.format('DD MMM YYYY')} - ...`;

	return fallback;
};

const VIBRANT_SHAPE_OPTIONS = ['circle', 'square', 'triangle'];
const DEFAULT_VIBRANT_SHAPES = ['circle'];
const SHAPE_CHAR_TO_NAME = { c: 'circle', s: 'square', t: 'triangle' };

// Accepts friendly names ('circle','square','triangle') or raw single-char
// codes ('c','s','t') from the original library and returns friendly names.
const normalizeVibrantShapes = shapes => {
	const source = Array.isArray(shapes) ? shapes : String(shapes || '').split(',');
	const names = source
		.map(shape => String(shape).trim().toLowerCase())
		.map(shape =>
			VIBRANT_SHAPE_OPTIONS.includes(shape) ? shape : SHAPE_CHAR_TO_NAME[shape] || null
		)
		.filter(Boolean);

	return names.length ? names : DEFAULT_VIBRANT_SHAPES;
};

const getVibrantShapeStyles = ({ shape, color, centerAlpha, midAlpha, edgeAlpha }) => {
	const background = `radial-gradient(circle at center, ${alpha(color, centerAlpha)} 0%, ${alpha(
		color,
		midAlpha
	)} 55%, ${alpha(color, edgeAlpha)} 100%)`;

	if (shape === 'triangle') {
		return {
			background,
			clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
			borderRadius: 0,
		};
	}

	if (shape === 'square') {
		// Sharp axis-aligned squares — matches the original Finisher implementation.
		return { background, borderRadius: 0 };
	}

	return { background, borderRadius: '50%' };
};

const randInRange = ({ min, max }) =>
	min === max ? min : Math.random() * (max - min) + min;
const randSign = () => (Math.random() > 0.5 ? 1 : -1);

const VIBRANT_DEFAULTS = {
	count: 6,
	size: { min: 950, max: 1200 },
	// Per-frame velocities (60 fps reference). Same numeric range the original
	// library uses; we convert dt → frame units in the RAF tick.
	speed: {
		x: { min: 0.1, max: 0.3 },
		y: { min: 0.1, max: 0.3 },
	},
	opacity: { center: 0.1, edge: 0.15 },
	skew: -2,
};

// DOM/CSS port of finisher.co/lab/header. Each particle is an absolutely
// positioned <div> with a radial-gradient background. React stays static
// (specs are memoized) and the RAF loop mutates transforms via refs, so
// React never re-renders during the animation. Algorithm mirrors the
// original: 4-quadrant random spawn, random shape per particle, signed
// velocities, container-edge bouncing, mobile particle reduction.
const VibrantHeader = ({
	isDark = false,
	animate = true,
	shapes = DEFAULT_VIBRANT_SHAPES,
	count: countProp,
	colors: colorsProp,
	blending: blendingProp,
	opacity: opacityProp,
	size: sizeProp,
	speed: speedProp,
	skew: skewProp,
}) => {
	const theme = useTheme();
	const skewBoxRef = useRef(null);
	const particleRefs = useRef([]);

	const activeShapes = useMemo(() => normalizeVibrantShapes(shapes), [shapes]);

	const palette = useMemo(() => {
		if (Array.isArray(colorsProp) && colorsProp.length) return colorsProp;

		return [theme.palette.primary.main, theme.palette.info.main];
	}, [colorsProp, theme.palette.info.main, theme.palette.primary.main]);

	const blending = blendingProp || (isDark ? 'screen' : 'overlay');
	const skew = typeof skewProp === 'number' ? skewProp : VIBRANT_DEFAULTS.skew;
	const count = typeof countProp === 'number' ? countProp : VIBRANT_DEFAULTS.count;

	const opacity = useMemo(
		() => ({ ...VIBRANT_DEFAULTS.opacity, ...(opacityProp || {}) }),
		[opacityProp]
	);
	const size = useMemo(
		() => ({ ...VIBRANT_DEFAULTS.size, ...(sizeProp || {}) }),
		[sizeProp]
	);
	const speed = useMemo(
		() => ({
			x: { ...VIBRANT_DEFAULTS.speed.x, ...(speedProp?.x || {}) },
			y: { ...VIBRANT_DEFAULTS.speed.y, ...(speedProp?.y || {}) },
		}),
		[speedProp]
	);

	// Per-particle static spec (color, shape, size, quadrant, gradient). Keys
	// are the index, so React preserves the same DOM nodes across renders and
	// our refs survive — important for the RAF loop's reads.
	const specs = useMemo(() => {
		const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
		const activeCount = isMobile && count > 5 ? Math.round(count / 2) : count;
		const midAlpha =
			typeof opacity.mid === 'number' ? opacity.mid : (opacity.center + opacity.edge) / 2;

		return Array.from({ length: activeCount }, (_, i) => {
			const colorHex = palette[i % palette.length];
			const shape = activeShapes[Math.floor(Math.random() * activeShapes.length)];
			const particleSize = Math.abs(randInRange(size));
			const quadrant = i % 4;
			const shapeStyles = getVibrantShapeStyles({
				shape,
				color: colorHex,
				centerAlpha: opacity.center,
				midAlpha,
				edgeAlpha: opacity.edge,
			});

			return { particleSize, quadrant, shapeStyles, key: i };
		});
	}, [activeShapes, count, opacity, palette, size]);

	useEffect(() => {
		if (typeof window === 'undefined') return undefined;
		const skewBox = skewBoxRef.current;
		if (!skewBox) return undefined;

		const bounds = { w: 1, h: 1 };
		let states = [];
		let rafId = null;
		let lastTime = null;
		let resizeTimeout = null;

		const measure = () => {
			bounds.w = Math.max(skewBox.offsetWidth, 1);
			bounds.h = Math.max(skewBox.offsetHeight, 1);
		};

		const initStates = () => {
			const halfW = bounds.w / 2;
			const halfH = bounds.h / 2;

			states = specs.map(spec => {
				const x = Math.random() * halfW;
				const y = Math.random() * halfH;
				let px;
				let py;

				if (spec.quadrant === 3) {
					px = x + halfW;
					py = y;
				} else if (spec.quadrant === 2) {
					px = x;
					py = y + halfH;
				} else if (spec.quadrant === 1) {
					px = x + halfW;
					py = y + halfH;
				} else {
					px = x;
					py = y;
				}

				return {
					x: px,
					y: py,
					vx: randInRange(speed.x) * randSign(),
					vy: randInRange(speed.y) * randSign(),
				};
			});
		};

		const drawFrame = frames => {
			for (let i = 0; i < states.length; i += 1) {
				const s = states[i];

				s.x += s.vx * frames;
				s.y += s.vy * frames;

				if (s.x < 0) {
					s.vx *= -1;
					s.x += 1;
				} else if (s.x > bounds.w) {
					s.vx *= -1;
					s.x -= 1;
				}

				if (s.y < 0) {
					s.vy *= -1;
					s.y += 1;
				} else if (s.y > bounds.h) {
					s.vy *= -1;
					s.y -= 1;
				}

				const el = particleRefs.current[i];
				if (el) {
					el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
				}
			}
		};

		const tick = now => {
			if (lastTime == null) lastTime = now;
			const dt = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;
			drawFrame(dt * 60);
			rafId = window.requestAnimationFrame(tick);
		};

		measure();
		initStates();
		drawFrame(0);

		if (animate) {
			lastTime = null;
			rafId = window.requestAnimationFrame(tick);
		}

		const handleResize = () => {
			window.clearTimeout(resizeTimeout);
			resizeTimeout = window.setTimeout(() => {
				measure();
				for (let i = 0; i < states.length; i += 1) {
					const s = states[i];
					if (s.x < 0) s.x = 0;
					else if (s.x > bounds.w) s.x = bounds.w;
					if (s.y < 0) s.y = 0;
					else if (s.y > bounds.h) s.y = bounds.h;
				}
				drawFrame(0);
			}, 150);
		};

		const observer =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
		if (observer) observer.observe(skewBox);
		window.addEventListener('resize', handleResize);

		return () => {
			if (rafId) window.cancelAnimationFrame(rafId);
			window.clearTimeout(resizeTimeout);
			window.removeEventListener('resize', handleResize);
			if (observer) observer.disconnect();
		};
	}, [animate, specs, speed]);

	return (
		<Box
			aria-hidden
			sx={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				pointerEvents: 'none',
				borderRadius: 'inherit',
			}}
		>
			<Box
				ref={skewBoxRef}
				sx={{
					position: 'absolute',
					inset: '-14% -10%',
					transform: `skewY(${skew}deg)`,
					transformOrigin: 'center',
				}}
			>
				{specs.map((spec, index) => (
					<Box
						key={spec.key}
						ref={el => {
							particleRefs.current[index] = el;
						}}
						sx={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: spec.particleSize,
							height: spec.particleSize,
							marginLeft: `-${spec.particleSize / 2}px`,
							marginTop: `-${spec.particleSize / 2}px`,
							mixBlendMode: blending,
							willChange: 'transform',
							...spec.shapeStyles,
						}}
					/>
				))}
			</Box>
		</Box>
	);
};

const KpiRibbonItem = ({ metric, delay = 0 }) => {
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
	const accent = theme.palette[metric.color]?.main || theme.palette.primary.main;
	// const trendPercentageColor =
	// 	metric.direction === 'positive'
	// 		? theme.palette.success.dark
	// 		: metric.direction === 'negative'
	// 			? theme.palette.error.dark
	// 			: theme.palette.text.secondary;
	const trendColor =
		metric.direction === 'positive'
			? theme.palette.success.dark
			: metric.direction === 'negative'
				? theme.palette.error.dark
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

	const [isOpen, setIsOpen] = useState(false);
	const [pending, setPending] = useState(() => ({
		fromDate: toDateValue(draftFromDate),
		toDate: toDateValue(draftToDate),
	}));

	useEffect(() => {
		if (isOpen) return;

		setPending({
			fromDate: toDateValue(draftFromDate),
			toDate: toDateValue(draftToDate),
		});
	}, [draftFromDate, draftToDate, isOpen]);

	useEffect(() => {
		if (typeof document === 'undefined') return undefined;

		const portalId = 'business-pulse-datepicker-portal';
		let node = document.getElementById(portalId);

		if (!node) {
			node = document.createElement('div');
			node.setAttribute('id', portalId);
			node.style.position = 'relative';
			node.style.zIndex = '1500';
			document.body.appendChild(node);
		}

		return undefined;
	}, []);

	const displayed = isOpen
		? pending
		: { fromDate: toDateValue(draftFromDate), toDate: toDateValue(draftToDate) };
	const displayLabel = formatDateLabel(
		displayed.fromDate,
		displayed.toDate,
		hasActivePeriod ? periodLabel : 'All Time'
	);
	const canApply =
		Boolean(pending.fromDate && pending.toDate) &&
		(dayjs(pending.fromDate).format('YYYY-MM-DD') !== draftFromDate ||
			dayjs(pending.toDate).format('YYYY-MM-DD') !== draftToDate);
	const canReset = hasActivePeriod || Boolean(pending.fromDate || pending.toDate);

	const handleApply = async () => {
		if (!pending.fromDate || !pending.toDate) return;

		const success = await onApplyDateRange({
			fromDate: dayjs(pending.fromDate).format('YYYY-MM-DD'),
			toDate: dayjs(pending.toDate).format('YYYY-MM-DD'),
		});

		if (success) setIsOpen(false);
	};

	const handleReset = async () => {
		if (hasActivePeriod) {
			await onResetDateRange();
			setIsOpen(false);
			return;
		}

		setPending({ fromDate: null, toDate: null });
	};

	const positiveColor = theme.palette.success.dark;
	const negativeColor = theme.palette.error.dark;
	const netColor =
		netDirection === 'positive'
			? positiveColor
			: netDirection === 'negative'
				? negativeColor
				: theme.palette.info.main;
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
					? `linear-gradient(135deg, ${alpha(
						theme.palette.primary.main,
						0.16
					)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 48%, ${alpha(
						theme.palette.info.main,
						0.05
					)} 100%)`
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
										backgroundColor: alpha(theme.palette.primary.main, 0.12),
										color: theme.palette.primary.main,
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
								<AppReactDatepicker
									selectsRange
									open={isOpen}
									startDate={pending.fromDate}
									endDate={pending.toDate}
									selected={pending.fromDate}
									onChange={dates => {
										const [start, end] = Array.isArray(dates) ? dates : [null, null];
										setPending({ fromDate: start, toDate: end });
									}}
									onInputClick={() => !isRefreshing && setIsOpen(true)}
									onClickOutside={() => setIsOpen(false)}
									onCalendarOpen={() => setIsOpen(true)}
									onCalendarClose={() => setIsOpen(false)}
									disabled={isRefreshing}
									shouldCloseOnSelect={false}
									popperPlacement="bottom-end"
									popperProps={{ strategy: 'fixed' }}
									portalId="business-pulse-datepicker-portal"
									customInput={<PulseDateInput displayValue={displayLabel} />}
								>
									<Box>
										<Divider />
										<Stack
											direction="row"
											spacing={1.5}
											justifyContent="flex-end"
											sx={{ p: 3 }}
										>
											<Button
												variant="text"
												color="secondary"
												onClick={handleReset}
												disabled={isRefreshing || !canReset}
											>
												Reset
											</Button>
											<Button
												variant="contained"
												onClick={handleApply}
												disabled={isRefreshing || !canApply}
											>
												Apply
											</Button>
										</Stack>
									</Box>
								</AppReactDatepicker>
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
											backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.6 : 1),
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
