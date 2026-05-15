'use client';

import { useEffect, useRef, useState } from 'react';

import { formatWholeNumber } from '@/utils/numberUtils';

export const CountUp = ({
	value = 0,
	duration = 900,
	formatter = formatWholeNumber,
	className,
	style,
}) => {
	const [display, setDisplay] = useState(0);
	const startRef = useRef(0);
	const fromRef = useRef(0);
	const rafRef = useRef(null);
	const displayRef = useRef(0);

	useEffect(() => {
		displayRef.current = display;
	}, [display]);

	useEffect(() => {
		const target = Number(value) || 0;
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion || duration <= 0) {
			setDisplay(target);
			return undefined;
		}

		fromRef.current = displayRef.current;
		startRef.current = performance.now();

		const easeOut = t => 1 - Math.pow(1 - t, 3);

		const step = now => {
			const elapsed = now - startRef.current;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOut(progress);
			const next = fromRef.current + (target - fromRef.current) * eased;
			setDisplay(next);

			if (progress < 1) {
				rafRef.current = requestAnimationFrame(step);
			} else {
				setDisplay(target);
			}
		};

		rafRef.current = requestAnimationFrame(step);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [duration, value]);

	return (
		<span className={className} style={style}>
			{formatter(Math.round(display))}
		</span>
	);
};
