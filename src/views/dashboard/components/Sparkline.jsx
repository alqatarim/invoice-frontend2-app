'use client';

import { useId } from 'react';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export const Sparkline = ({
	values = [],
	color,
	height = 28,
	width = 80,
	strokeWidth = 1.6,
}) => {
	const theme = useTheme();
	const stroke = color || theme.palette.primary.main;
	const fill = alpha(stroke, 0.18);
	const id = useId();
	const gradId = `spark-${id.replace(/[^a-z0-9]/gi, '')}`;

	const cleaned = (Array.isArray(values) ? values : [])
		.filter(value => value !== null && value !== undefined && Number.isFinite(Number(value)))
		.map(Number);

	if (cleaned.length < 2) {
		return <Box sx={{ width, height, opacity: 0.3 }} />;
	}

	const min = Math.min(...cleaned);
	const max = Math.max(...cleaned);
	const span = max - min;
	const isFlat = span === 0;
	const verticalPadding = Math.max(strokeWidth + 2, 4);
	const horizontalPadding = Math.max(strokeWidth + 2, 4);
	const drawableHeight = Math.max(height - verticalPadding * 2, 1);
	const drawableWidth = Math.max(width - horizontalPadding * 2, 1);
	const stepX = drawableWidth / (cleaned.length - 1);

	const points = cleaned.map((value, index) => {
		const x = horizontalPadding + index * stepX;
		const y = isFlat
			? height / 2
			: height - verticalPadding - ((value - min) / span) * drawableHeight;

		return [x, y];
	});

	const linePath = points
		.map((point, index) =>
			index === 0 ? `M ${point[0]} ${point[1]}` : `L ${point[0]} ${point[1]}`
		)
		.join(' ');
	const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
	const lastPoint = points[points.length - 1];

	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
			<defs>
				<linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor={fill} stopOpacity="0.95" />
					<stop offset="100%" stopColor={fill} stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={areaPath} fill={`url(#${gradId})`} />
			<motion.path
				d={linePath}
				fill="none"
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				initial={{ pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{ duration: 0.9, ease: 'easeOut' }}
			/>
			<circle cx={lastPoint[0]} cy={lastPoint[1]} r={2.4} fill={stroke} />
		</svg>
	);
};
