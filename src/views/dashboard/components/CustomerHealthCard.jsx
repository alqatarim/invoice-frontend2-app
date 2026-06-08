'use client';

import { memo } from 'react';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

import CustomAvatar from '@core/components/mui/Avatar';
import { dashboardEasing } from '@/data/dataSets';
import { RiyalIcon } from '@/utils/currencyUtils';
import { formatCompactNumber } from '@/utils/numberUtils';

import { CountUp } from './CountUp';

const HealthBar = ({ label, value, color, delay = 0 }) => (
	<Stack spacing={0.8}>
		<Stack direction="row" justifyContent="space-between">
			<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
				{label}
			</Typography>
			<Typography variant="caption" sx={{ fontWeight: 700, color }}>
				{value}%
			</Typography>
		</Stack>
		<Box
			sx={{
				height: 8,
				width: '100%',
				borderRadius: 4,
				backgroundColor: alpha(color, 0.12),
				overflow: 'hidden',
			}}
		>
			<Box
				component={motion.div}
				initial={{ width: 0 }}
				animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
				transition={{ duration: 0.9, ease: 'easeOut', delay }}
				sx={{ height: '100%', backgroundColor: color, borderRadius: 4 }}
			/>
		</Box>
	</Stack>
);

const CustomerHealthCardImpl = ({ data = {}, delay = 0, panelMinHeight = 295 }) => {
	const theme = useTheme();
	const repeatRate = Number(data?.repeatRate || 0);
	const activeRate = Number(data?.activeRate || 0);
	const repeatColor =
		repeatRate >= 50
			? theme.palette.success.main
			: repeatRate >= 25
				? theme.palette.warning.main
				: theme.palette.error.main;

	return (
		<Card
			component={motion.div}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease: dashboardEasing, delay }}
			sx={{
				width: '100%',
				height: '100%',
				minHeight: panelMinHeight,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<CardContent
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					p: { xs: 2.5, md: 3 },
				}}
			>
				<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 600 }}>
							Customer health
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							{data?.total || 0} total customers
						</Typography>
					</Box>
					<CustomAvatar color="primary" skin="light" variant="rounded" size={36}>
						<Icon icon="ri-heart-pulse-line" width="1.15rem" />
					</CustomAvatar>
				</Stack>

				<Stack
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						gap: 4,
					}}
				>
					<Stack spacing={3}>
						<HealthBar
							label="Active rate"
							value={activeRate}
							color={theme.palette.primary.main}
							delay={delay + 0.1}
						/>
						<HealthBar
							label="Repeat rate"
							value={repeatRate}
							color={repeatColor}
							delay={delay + 0.2}
						/>
					</Stack>

					<Stack direction="row" spacing={1.5}>
						<Box
							sx={{
								flex: 1,
								p: 2,
								borderRadius: 2,
								backgroundColor: alpha(theme.palette.success.main, 0.08),
							}}
						>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								New this week
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
								<CountUp value={data?.newCustomersThisWeek || 0} />
							</Typography>
						</Box>
						<Box
							sx={{
								flex: 1,
								p: 2,
								borderRadius: 2,
								backgroundColor: alpha(theme.palette.info.main, 0.08),
							}}
						>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								Avg invoice
							</Typography>
							<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
								<RiyalIcon width="1rem" color={theme.vars.palette.text.primary} />
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									<CountUp
										value={data?.averageInvoiceValue || 0}
										formatter={formatCompactNumber}
									/>
								</Typography>
							</Stack>
						</Box>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
};

export const CustomerHealthCard = memo(CustomerHealthCardImpl, (prev, next) => {
	const previousData = prev.data || {};
	const nextData = next.data || {};

	return (
		prev.delay === next.delay &&
		prev.panelMinHeight === next.panelMinHeight &&
		previousData.repeatRate === nextData.repeatRate &&
		previousData.activeRate === nextData.activeRate &&
		previousData.total === nextData.total &&
		previousData.newCustomersThisWeek === nextData.newCustomersThisWeek &&
		previousData.averageInvoiceValue === nextData.averageInvoiceValue
	);
});
