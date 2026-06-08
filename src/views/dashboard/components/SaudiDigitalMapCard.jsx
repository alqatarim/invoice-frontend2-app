'use client';

import { memo, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion, useReducedMotion } from 'framer-motion';

import CustomAvatar from '@core/components/mui/Avatar';
import { dashboardEasing } from '@/data/dataSets';

const LOCATION_COLORS = ['primary', 'info', 'success', 'warning', 'error', 'secondary'];
const MAX_POPUP_LOCATIONS = 3;

const normalizeMapKey = value =>
	String(value || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '');

const getCoordinate = value => {
	const mapX = Number(value?.mapX);
	const mapY = Number(value?.mapY);

	return Number.isFinite(mapX) && Number.isFinite(mapY) ? { mapX, mapY } : null;
};

const buildCoordinateIndex = provincesCities => {
	const provinceCoordinates = new Map();
	const cityCoordinates = new Map();

	(Array.isArray(provincesCities) ? provincesCities : []).forEach(province => {
		const provinceCoordinate = getCoordinate(province?.mapCoordinates);
		const provinceKeys = [
			normalizeMapKey(province?.province),
			normalizeMapKey(province?.display_name),
		].filter(Boolean);

		provinceKeys.forEach(key => {
			if (provinceCoordinate) provinceCoordinates.set(key, provinceCoordinate);
		});

		(province?.cities || []).forEach(city => {
			const cityCoordinate = getCoordinate(city?.mapCoordinates) || provinceCoordinate;
			const cityKey = normalizeMapKey(city?.name);

			if (!cityKey || !cityCoordinate) return;

			provinceKeys.forEach(provinceKey => {
				cityCoordinates.set(`${provinceKey}:${cityKey}`, cityCoordinate);
			});
			if (!cityCoordinates.has(cityKey)) {
				cityCoordinates.set(cityKey, cityCoordinate);
			}
		});
	});

	return { provinceCoordinates, cityCoordinates };
};

const getStoreCoordinate = (store, coordinateIndex) => {
	const cityKey = normalizeMapKey(store?.city);
	const provinceKeys = [
		normalizeMapKey(store?.province),
		normalizeMapKey(String(store?.province || '').replace(/\s+Province$/i, '')),
	].filter(Boolean);

	for (const provinceKey of provinceKeys) {
		const cityCoordinate = coordinateIndex.cityCoordinates.get(`${provinceKey}:${cityKey}`);
		if (cityCoordinate) return cityCoordinate;
	}

	return (
		coordinateIndex.cityCoordinates.get(cityKey) ||
		provinceKeys.map(key => coordinateIndex.provinceCoordinates.get(key)).find(Boolean) ||
		null
	);
};

const isActiveStore = store => {
	const type = String(store?.type || '').trim().toUpperCase();
	const branchType = String(store?.branchType || '').trim().toLowerCase();

	return store?.status !== false && (type === 'STORE' || branchType === 'store');
};

const buildStoreLocations = (stores, provincesCities) => {
	const groupedLocations = new Map();
	const coordinateIndex = buildCoordinateIndex(provincesCities);

	(Array.isArray(stores) ? stores : []).filter(isActiveStore).forEach(store => {
		const coordinate = getStoreCoordinate(store, coordinateIndex);

		if (!coordinate) return;

		const city = String(store?.city || 'Unknown city').trim();
		const region = String(store?.province || 'Saudi Arabia').trim();
		const locationKey = [
			normalizeMapKey(city),
			normalizeMapKey(region),
			coordinate.mapX,
			coordinate.mapY,
		].join(':');
		const existingLocation = groupedLocations.get(locationKey);

		if (existingLocation) {
			existingLocation.stores.push(store);
			return;
		}

		groupedLocations.set(locationKey, {
			city,
			region,
			mapX: coordinate.mapX,
			mapY: coordinate.mapY,
			stores: [store],
		});
	});

	return Array.from(groupedLocations.values()).map((location, index) => ({
		...location,
		color: LOCATION_COLORS[index % LOCATION_COLORS.length],
		label: `${location.stores.length} active store${location.stores.length === 1 ? '' : 's'}`,
	}));
};

const signalRings = [0, 1, 2];

const SAUDI_OUTLINE_PATH =
	'M66.3 67.0 L74.6 58.6 L59.9 42.5 L92.5 32.0 L110.6 35.5 L135.1 48.5 L173.9 79.6 L214.6 83.0 L218.2 90.7 L229.0 90.5 L235.9 106.3 L241.9 107.8 L239.8 108.6 L242.1 111.7 L253.9 120.7 L252.0 120.5 L255.4 128.7 L254.2 131.2 L252.0 129.7 L263.9 152.0 L266.5 154.9 L273.5 154.0 L271.3 159.2 L275.9 160.5 L289.8 180.7 L325.9 188.0 L329.3 185.2 L336.0 196.6 L326.0 228.8 L281.4 244.8 L238.8 250.9 L224.8 258.2 L214.5 275.5 L210.1 278.3 L207.4 278.1 L203.8 272.7 L194.0 273.4 L181.2 270.3 L162.3 272.5 L153.4 267.8 L150.7 279.2 L152.6 280.8 L146.1 288.0 L138.5 270.6 L129.0 262.2 L122.1 249.9 L121.4 243.8 L115.2 232.3 L100.1 222.5 L92.3 211.1 L88.7 198.0 L90.8 187.5 L81.0 167.1 L67.5 159.3 L61.7 150.3 L62.6 145.0 L54.0 133.3 L54.6 130.4 L34.2 100.0 L31.2 97.4 L24.0 97.5 L29.7 77.2 L46.1 80.0 L56.2 68.9 L66.3 67.0 Z';

// Internal region borders traced from the accurate Saudi ADM1 vector source.
// Only shared edges are kept, so the main country outline is the single border
// drawn along Saudi Arabia's perimeter.
const SAUDI_INTERNAL_BORDER_PATHS = [
	'M125.8 84.0 L112.9 83.9 L92.4 93.2',
	'M92.4 93.2 L92.3 89.2 L85.6 83.2 L85.6 77.8 L82.5 76.7 L79.5 81.9 L76.9 81.6 L77.6 74.8 L69.7 73.1 L69.6 69.2 L66.3 67.0',
	'M92.4 93.2 L91.6 95.4 L95.3 98.2 L92.9 100.0 L101.5 103.8 L104.9 114.4 L100.9 113.1 L96.9 119.7',
	'M74.2 38.6 L73.0 47.0 L77.6 45.5 L77.5 52.7 L91.4 50.9 L94.2 47.2 L94.9 51.9 L107.3 54.3 L119.2 53.5 L121.1 57.3 L128.5 57.4 L127.6 59.1 L133.9 64.3 L126.0 68.8 L129.0 79.3 L126.0 80.3 L125.8 84.0',
	'M96.9 119.7 L81.0 117.9 L76.2 112.5 L73.4 112.8 L72.4 107.8 L61.2 106.9 L54.4 109.4 L60.9 118.8 L61.9 125.3 L64.4 125.5 L67.2 133.2 L71.2 134.7 L72.2 146.0 L75.2 148.8 L65.3 154.6',
	'M96.9 119.7 L101.9 125.4 L103.9 141.2 L108.6 142.9 L116.9 138.0 L123.1 138.8',
	'M168.7 96.0 L163.2 103.8 L154.6 107.4 L155.1 112.9 L152.7 115.5 L123.1 138.8',
	'M168.7 96.0 L167.8 92.9 L160.8 93.9 L154.0 91.2 L151.0 94.2 L142.9 86.6 L127.1 84.0',
	'M168.7 96.0 L176.2 107.6',
	'M168.7 96.0 L179.3 86.3 L186.9 91.3 L188.6 87.7 L186.9 80.8',
	'M123.1 138.8 L127.8 143.6 L132.8 144.7 L135.6 151.0',
	'M176.2 107.6 L175.8 119.2 L169.2 117.9 L170.2 130.6 L174.9 136.6 L173.7 139.8 L169.7 138.2 L158.5 144.2 L155.7 143.6 L149.7 147.6 L151.2 150.8 L149.3 153.4 L141.8 154.4 L140.0 150.8 L135.6 151.0',
	'M176.2 107.6 L178.2 106.3 L181.5 113.8 L185.7 113.8 L193.4 120.3 L207.2 122.2 L216.3 126.3 L217.7 129.8 L219.3 142.9 L216.6 146.9 L218.3 154.7 L221.7 153.7 L224.0 160.9 L221.0 187.8 L217.7 195.9 L224.2 197.6 L217.8 205.0 L218.5 210.5 L223.4 216.3 L213.9 239.8',
	'M135.6 151.0 L134.2 163.4 L128.6 166.7',
	'M128.6 166.7 L123.3 169.7 L124.4 176.7 L108.7 186.3 L101.1 181.7 L100.9 177.0 L94.3 178.4 L87.8 170.8 L83.8 171.8',
	'M128.6 166.7 L136.7 167.9 L140.4 175.9 L151.4 183.2 L160.5 216.3',
	'M160.5 216.3 L151.4 214.3 L141.0 223.7 L135.9 220.8',
	'M160.5 216.3 L163.6 219.0 L166.5 232.5 L165.2 237.0 L168.3 237.5',
	'M135.9 220.8 L135.5 217.8 L129.5 217.2 L125.0 213.6 L120.6 223.5 L119.2 221.6 L116.7 225.3 L120.9 236.7 L125.8 237.0 L129.2 233.2',
	'M135.9 220.8 L129.6 233.6',
	'M129.6 233.6 L132.9 242.2 L131.2 243.9 L128.0 242.1 L125.8 245.8 L128.4 250.9 L125.0 252.9',
	'M213.9 239.8 L282.2 239.9 L282.3 244.5',
	'M213.9 239.8 L182.9 239.8 L179.4 241.7 L179.1 237.4 L168.5 237.9',
	'M158.7 271.5 L157.8 263.1 L164.0 248.3 L168.4 246.3 L168.5 238.0',
	'M151.9 270.1 L147.2 265.5 L140.1 265.6 L137.8 261.3 L132.9 265.5',
];

const SaudiDigitalMapCardImpl = ({ stores = [], provincesCities = [], delay = 0.3 }) => {
	const router = useRouter();
	const theme = useTheme();
	const { mode, systemMode } = useColorScheme();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
	const prefersReducedMotion = useReducedMotion();
	const [selectedLocation, setSelectedLocation] = useState(null);
	const storeLocations = useMemo(
		() => buildStoreLocations(stores, provincesCities),
		[provincesCities, stores]
	);

	const panelBorder = alpha(theme.palette.text.primary, isDark ? 0.18 : 0.08);
	const mapStroke = alpha(theme.palette.primary.main, isDark ? 0.75 : 0.6);
	const popupOpensLeft = selectedLocation?.mapX > 240;
	const popupOpensAbove = selectedLocation?.mapY > 225;
	const popupX = selectedLocation ? (selectedLocation.mapX / 360) * 100 : 0;
	const popupY = selectedLocation ? (selectedLocation.mapY / 320) * 100 : 0;
	const popupWidth = 232;
	const popupHeightEstimate = 176;
	const visiblePopupStores = selectedLocation?.stores?.slice(0, MAX_POPUP_LOCATIONS) || [];
	const hiddenPopupStoreCount = Math.max(
		(selectedLocation?.stores?.length || 0) - MAX_POPUP_LOCATIONS,
		0
	);

	const handleLocationOpen = location => {
		const searchParams = new URLSearchParams();
		searchParams.set('province', location.region);
		searchParams.set('city', location.city);
		router.push(`/stores?${searchParams.toString()}`);
	};

	const handleLocationKeyDown = (event, location) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();
		handleLocationOpen(location);
	};

	return (
		<Card
			component={motion.div}
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease: dashboardEasing, delay }}
			sx={{
				height: '100%',
				minHeight: { xs: 360, md: 510 },
				overflow: 'visible',
				position: 'relative',
				zIndex: selectedLocation ? theme.zIndex.tooltip : 1,
				border: `1px solid ${panelBorder}`,
				// backgroundImage: `radial-gradient(circle at 18% 12%, ${alpha(
				// 	theme.palette.primary.main,
				// 	isDark ? 0.22 : 0.14
				// )} 0%, transparent 34%), radial-gradient(circle at 86% 74%, ${alpha(
				// 	theme.palette.info.main,
				// 	isDark ? 0.2 : 0.12
				// )} 0%, transparent 32%)`,
			}}
		>
			<Box
				aria-hidden
				sx={{
					position: 'absolute',
					inset: 0,
					opacity: isDark ? 0.28 : 0.18,
					backgroundImage: `linear-gradient(${alpha(
						theme.palette.primary.main,
						0.42
					)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
						theme.palette.primary.main,
						0.42
					)} 1px, transparent 1px)`,
					backgroundSize: '34px 34px',
					maskImage: 'linear-gradient(to bottom, black, transparent 92%)',
					WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 92%)',
				}}
			/>

			<CardContent
				sx={{
					position: 'relative',
					zIndex: 1,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'visible',
					p: { xs: 2.5, md: 3 },
				}}
			>
				<Stack direction="row" justifyContent="flex-start" alignItems="center" gap={3} sx={{ mb: 1 }}>




					<CustomAvatar color="primary" skin="light" variant="rounded" size={36}>
						<Icon icon="ri-map-pin-2-line" width="1.15rem" />
					</CustomAvatar>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Locations
					</Typography>
				</Stack>

				<Box
					sx={{
						position: 'relative',
						flex: 1,
						minHeight: 405,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'visible',
					}}
					onMouseLeave={() => setSelectedLocation(null)}
				>
					<Box
						sx={{
							position: 'relative',
							width: { xs: '100%', md: '112%' },
							maxWidth: { xs: 460, md: 620 },
							mx: { md: '-6%' },
							aspectRatio: '360 / 320',
							overflow: 'visible',
						}}
					>
						<Box
							component="svg"
							viewBox="0 0 360 320"
							role="img"
							aria-label="Digital map of Saudi Arabia store locations"
							sx={{
								display: 'block',
								width: '100%',
								height: '100%',
								filter: `drop-shadow(0 24px 38px ${alpha(theme.palette.primary.main, 0.18)})`,
							}}
						>
							<defs>
								<filter id="saudiGlow">
									<feGaussianBlur stdDeviation="3" result="coloredBlur" />
									<feMerge>
										<feMergeNode in="coloredBlur" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
								<filter id="saudiOuterBorderGlow" x="-25%" y="-25%" width="150%" height="150%">
									<feGaussianBlur stdDeviation="5" result="softGlow" />
									<feMerge>
										<feMergeNode in="softGlow" />
									</feMerge>
								</filter>
								<filter id="saudiMapLiftShadow" x="-20%" y="-20%" width="140%" height="140%">
									<feDropShadow
										dx="0"
										dy="10"
										stdDeviation="10"
										floodColor={theme.palette.primary.main}
										floodOpacity={isDark ? 0.10 : 0.16}
									/>
								</filter>
								<mask id="saudiOuterGlowMask" x="-72" y="-64" width="504" height="448" maskUnits="userSpaceOnUse">
									<rect x="-72" y="-64" width="504" height="448" fill="white" />
									<path
										d={SAUDI_OUTLINE_PATH}
										fill="black"
										stroke="black"
										strokeWidth="3"
										strokeLinejoin="round"
									/>
								</mask>
							</defs>

							<path
								d={SAUDI_OUTLINE_PATH}
								fill={alpha(theme.palette.primary.main, isDark ? 0.04 : 0.04)}
								filter="url(#saudiMapLiftShadow)"
							/>
							<motion.path
								d={SAUDI_OUTLINE_PATH}
								fill="none"
								stroke={alpha(theme.palette.primary.main, isDark ? 0.26 : 0.2)}
								strokeWidth="18"
								strokeLinejoin="round"
								filter="url(#saudiOuterBorderGlow)"
								mask="url(#saudiOuterGlowMask)"
								vectorEffect="non-scaling-stroke"
								animate={
									prefersReducedMotion
										? undefined
										: {
											opacity: [0.62, 0.9, 0.62],
											strokeWidth: [16, 21, 16],
										}
								}
								transition={{
									duration: 4.8,
									ease: 'easeInOut',
									repeat: Infinity,
								}}
							/>
							<path
								d={SAUDI_OUTLINE_PATH}
								fill={theme.palette.primary.lighterOpacity}
								stroke={mapStroke}
								strokeWidth="2"
								filter="url(#saudiGlow)"
							/>
							<g aria-label="Saudi region borders">
								{SAUDI_INTERNAL_BORDER_PATHS.map(path => (
									<path
										key={`${path}-halo`}
										d={path}
										fill="none"
										stroke={alpha(theme.palette.background.paper, isDark ? 0.3 : 0.46)}
										strokeWidth={isDark ? 1 : 3}
										strokeLinecap="round"
										strokeLinejoin="round"
										vectorEffect="non-scaling-stroke"
									/>
								))}
								{SAUDI_INTERNAL_BORDER_PATHS.map(path => (
									<path
										key={path}
										d={path}
										fill="none"
										stroke={mapStroke}
										strokeWidth={isDark ? 1.2 : 1.6}
										strokeLinecap="round"
										strokeLinejoin="round"
										vectorEffect="non-scaling-stroke"
									/>
								))}
							</g>
							<path
								d={SAUDI_OUTLINE_PATH}
								fill="none"
								stroke={mapStroke}
								strokeWidth="2.2"
								vectorEffect="non-scaling-stroke"
							/>
							{storeLocations.map((location, index) => {
								const accent = theme.palette[location.color]?.main || theme.palette.primary.main;
								const isSelected = selectedLocation?.city === location.city && selectedLocation?.region === location.region;

								return (
									<g
										key={`${location.city}-${location.region}`}
										transform={`translate(${location.mapX} ${location.mapY})`}
										tabIndex={0}
										aria-label={`${location.city}, ${location.region}, ${location.label}`}
										onMouseEnter={() => setSelectedLocation(location)}
										onFocus={() => setSelectedLocation(location)}
										onClick={() => handleLocationOpen(location)}
										onKeyDown={event => handleLocationKeyDown(event, location)}
										style={{ cursor: 'pointer', outline: 'none' }}
									>
										{prefersReducedMotion
											? null
											: signalRings.map(ring => (
												<motion.circle
													key={ring}
													r="7"
													fill="none"
													stroke={accent}
													strokeWidth="1.2"
													initial={{ scale: 1, opacity: 0.26 }}
													animate={{ scale: [1, 2.8], opacity: [0.26, 0] }}
													transition={{
														duration: 2.4,
														delay: ring * 0.45 + index * 0.12,
														repeat: Infinity,
														ease: 'easeOut',
													}}
													style={{ transformOrigin: 'center' }}
												/>
											))}
										<motion.circle
											r={isSelected ? 8 : 6}
											fill={accent}
											stroke={theme.palette.background.paper}
											strokeWidth="3"
											initial={{ opacity: 0, scale: 0.7 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{
												duration: 0.35,
												ease: dashboardEasing,
												delay: delay + 0.25 + index * 0.08,
											}}
											style={{
												filter: `drop-shadow(0 0 8px ${alpha(accent, 0.75)})`,
												transformOrigin: 'center',
											}}
										/>
									</g>
								);
							})}
						</Box>

						{storeLocations.length === 0 ? (
							<Box
								sx={{
									position: 'absolute',
									left: '50%',
									top: '50%',
									transform: 'translate(-50%, -50%)',
									width: { xs: 190, sm: 230 },
									p: 2,
									borderRadius: 2.5,
									textAlign: 'center',
									backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.82 : 0.9),
									backdropFilter: 'blur(14px)',
									boxShadow: `0 18px 45px ${alpha(theme.palette.common.black, isDark ? 0.26 : 0.1)}`,
								}}
							>
								<Typography sx={{ fontWeight: 700, lineHeight: 1.25 }}>
									No active stores found
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
									Add stores with city and province to show them here.
								</Typography>
							</Box>
						) : null}

						{selectedLocation ? (
							<Box
								onMouseEnter={() => setSelectedLocation(selectedLocation)}
								onClick={() => handleLocationOpen(selectedLocation)}
								sx={{
									position: 'absolute',
									left: {
										xs: popupOpensLeft
											? `clamp(8px, calc(${popupX}% - ${popupWidth - 20}px), calc(100% - ${popupWidth - 8}px))`
											: `clamp(8px, calc(${popupX}% + 20px), calc(100% - ${popupWidth - 8}px))`,
										sm: popupOpensLeft
											? `clamp(8px, calc(${popupX}% - ${popupWidth + 18}px), calc(100% - ${popupWidth}px))`
											: `clamp(8px, calc(${popupX}% + 22px), calc(100% - ${popupWidth}px))`,
									},
									top: popupOpensAbove
										? `clamp(8px, calc(${popupY}% - ${popupHeightEstimate}px), calc(100% - ${popupHeightEstimate}px))`
										: `clamp(8px, calc(${popupY}% + 22px), calc(100% - ${popupHeightEstimate}px))`,
									zIndex: theme.zIndex.tooltip + 1,
									cursor: 'pointer',

								}}
							>
								<Box
									component={motion.div}
									initial={{ opacity: 0, y: popupOpensAbove ? -4 : 4, scale: 0.98 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.25, ease: dashboardEasing }}
									sx={{
										width: popupWidth,
										px: 2.5,
										py: 1.5,
										borderRadius: 3.5,
										display: 'flex',
										flexDirection: 'column',
										border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.68)}`,
										// background: isDark
										// 	? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(theme.palette.background.default, 0.78)})`
										// 	: `linear-gradient(145deg, ${alpha(theme.palette.common.white, 0.98)}, ${alpha(theme.palette.background.paper, 0.9)})`,

										background: theme.vars.palette.background.paper,
										backdropFilter: 'blur(18px) saturate(1.2)',
										boxShadow: `0 18px 48px ${alpha(theme.palette.common.black, isDark ? 0.36 : 0.16)}`,
									}}
								>
									<Stack direction="row" alignItems="center" spacing={1.2} sx={{ p: 1 }}>
										{/* <Box
											sx={{
												width: 34,
												height: 34,
												borderRadius: 2,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor:
													theme.palette[selectedLocation.color]?.main || theme.palette.primary.main,
												boxShadow: `0 10px 24px ${alpha(
													theme.palette[selectedLocation.color]?.main || theme.palette.primary.main,
													0.28
												)}`,
												flexShrink: 0,
											}}
										>
											<Icon
												icon="ri-store-2-line"
												width="1rem"
												style={{ color: theme.palette.common.white }}
											/>
										</Box> */}
										<Box sx={{ minWidth: 0, flex: 1 }}>
											<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
												<Box sx={{ minWidth: 0 }}>
													<Typography
														color='text.primary'
														sx={{ fontWeight: 650, lineHeight: 1.15, fontSize: '0.98rem' }}>
														{selectedLocation.city}
													</Typography>
													<Typography variant="body2" fontSize='0.75rem' >
														{selectedLocation.region}
													</Typography>
												</Box>
												<Chip
													size="small"
													color="secondary"
													variant="tonal"
													label={`${selectedLocation.stores.length} ${selectedLocation.stores.length === 1 ? 'branch' : 'branches'}`}
													sx={{
														// flexShrink: 0,
														height: 24,
														// borderRadius: 999,
														fontSize: '0.7rem',
														fontWeight: 600,
														'& .MuiChip-label': {
															px: 2,
														},
													}}
												/>
											</Stack>
										</Box>
									</Stack>

									<Stack
										spacing={0.75}
										sx={{
											mt: 0.5,
											p: 1.2,
											// borderRadius: 2.5,
											// backgroundColor: 'alpha(theme.palette.text.primary, isDark ? 0.08 : 0.035)',
										}}
									>
										{visiblePopupStores.map(store => (
											<Stack
												key={store?._id || store?.id || store?.branchId || store?.name}
												direction="row"
												alignItems="center"
												spacing={1}
												sx={{
													minWidth: 0,
												}}
											>
												<Box
													sx={{
														width: 5,
														height: 5,
														borderRadius: '50%',
														backgroundColor:
															theme.palette[selectedLocation.color]?.main || theme.palette.primary.main,
														flexShrink: 0,
													}}
												/>
												<Typography
													variant="body2"
													sx={{
														color: 'text.secondary',
														display: 'block',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap',
														fontWeight: 500,
													}}
												>
													{store?.name || store?.storeCode || 'Store'}
												</Typography>
											</Stack>
										))}
										{hiddenPopupStoreCount > 0 ? (
											<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, pl: 1.5 }}>
												+{hiddenPopupStoreCount} More
											</Typography>
										) : null}
									</Stack>

									<Stack
										direction="row"
										alignItems="center"
										justifyContent="flex-end"
										spacing={0}
										sx={{
											mt: 1,
											px: 1.2,
											py: 0.9,
											width: 'fit-content',
											alignSelf: 'flex-end',
											borderRadius: 2.2,
											color: 'primary.main',
											backgroundColor: theme.palette.primary.lighterOpacity,
											transition: 'background-color 0.2s ease, transform 0.2s ease',
											'&:hover': {
												backgroundColor: theme.palette.primary.lightOpacity,
												transform: 'translateY(-1px)',
											},
										}}
									>
										<Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, px: 2 }}>
											View Locations
										</Typography>
										<Icon
											icon="ri-arrow-right-up-line"
											width="0.9rem"
											style={{ color: theme.palette.primary.main }}
										/>
									</Stack>
								</Box>
							</Box>
						) : null}
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
};

export const SaudiDigitalMapCard = memo(SaudiDigitalMapCardImpl);
