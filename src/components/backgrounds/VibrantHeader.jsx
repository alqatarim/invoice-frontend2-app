'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const VIBRANT_SHAPE_OPTIONS = ['circle', 'square', 'triangle'];
export const DEFAULT_VIBRANT_SHAPES = ['circle'];
const SHAPE_CHAR_TO_NAME = { c: 'circle', s: 'square', t: 'triangle' };

const LIGHT_PARTICLE_OPACITY = { center: 0.1, edge: 0.15 };
const DARK_PARTICLE_OPACITY = { center: 0.08, edge: 0.11 };

const buildDefaultPaletteEntries = (theme, isDark) => [
	{
		type: 'alpha',
		color: isDark ? theme.palette.primary.dark : theme.palette.primary.main,
	},
	{
		type: 'alpha',
		color: isDark ? theme.palette.info.dark : theme.palette.info.main,
	},
];

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

const getShapeClipStyles = shape => {
	if (shape === 'triangle') {
		return {
			clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
			borderRadius: 0,
		};
	}

	if (shape === 'square') {
		return { borderRadius: 0 };
	}

	return { borderRadius: '50%' };
};

const buildAlphaGradient = ({ color, centerAlpha, midAlpha, edgeAlpha }) =>
	`radial-gradient(circle at center, ${alpha(color, centerAlpha)} 0%, ${alpha(
		color,
		midAlpha
	)} 55%, ${alpha(color, edgeAlpha)} 100%)`;

const getVibrantShapeStyles = ({ shape, background }) => ({
	background,
	...getShapeClipStyles(shape),
});

const randInRange = ({ min, max }) =>
	min === max ? min : Math.random() * (max - min) + min;
const randSign = () => (Math.random() > 0.5 ? 1 : -1);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Deterministic -1..1 jitter so first paint placement is stable and evenly relaxed.
const seededJitter = (index, salt = 0) => {
	const t = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
	return (t - Math.floor(t)) * 2 - 1;
};

// Soft quadrant centroids keep blobs near each other without crowding one corner.
const QUADRANT_ANCHORS = [
	{ x: 0.3, y: 0.33 },
	{ x: 0.7, y: 0.31 },
	{ x: 0.31, y: 0.69 },
	{ x: 0.69, y: 0.67 },
];

const ANCHOR_JITTER = 0.09;
const ANCHOR_LAYER_STEP = 0.035;

const buildSpecAnchor = (quadrant, index) => {
	const layer = Math.floor(index / 4);
	const anchor = QUADRANT_ANCHORS[quadrant] || QUADRANT_ANCHORS[0];

	return {
		x: clamp(
			anchor.x + seededJitter(index, quadrant) * (ANCHOR_JITTER + layer * ANCHOR_LAYER_STEP),
			0.18,
			0.82
		),
		y: clamp(
			anchor.y + seededJitter(index, quadrant + 5) * (ANCHOR_JITTER + layer * ANCHOR_LAYER_STEP),
			0.18,
			0.82
		),
	};
};

const buildParticleState = (spec, index, bounds, speed) => ({
	x: bounds.w * spec.anchor.x,
	y: bounds.h * spec.anchor.y,
	vx: randInRange(speed.x) * randSign(),
	vy: randInRange(speed.y) * randSign(),
});

const applyParticleTransform = (element, x, y) => {
	if (!element) return;
	element.style.left = '0px';
	element.style.top = '0px';
	element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
};

const MIN_MEASURED_BOUNDS = 8;

const measureBounds = element => {
	const w = element?.offsetWidth ?? 0;
	const h = element?.offsetHeight ?? 0;
	if (w < MIN_MEASURED_BOUNDS || h < MIN_MEASURED_BOUNDS) return null;
	return { w, h };
};

const VIBRANT_DEFAULTS = {
	count: 6,
	size: { min: 950, max: 1200 },
	speed: {
		x: { min: 0.1, max: 0.3 },
		y: { min: 0.1, max: 0.3 },
	},
	skew: -2,
};

// DOM/CSS port of finisher.co/lab/header. Each particle is an absolutely
// positioned <div> with a radial-gradient background. React stays static
// (specs are memoized) and the RAF loop mutates transforms via refs, so
// React never re-renders during the animation.
export const VibrantHeader = ({
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

	const paletteEntries = useMemo(() => {
		if (Array.isArray(colorsProp) && colorsProp.length) {
			return colorsProp.map(color => ({ type: 'alpha', color }));
		}

		return buildDefaultPaletteEntries(theme, isDark);
	}, [colorsProp, isDark, theme]);

	const blending = blendingProp || (isDark ? 'soft-light' : 'overlay');
	const skew = typeof skewProp === 'number' ? skewProp : VIBRANT_DEFAULTS.skew;
	const count = typeof countProp === 'number' ? countProp : VIBRANT_DEFAULTS.count;

	const opacity = useMemo(() => {
		const baseOpacity = isDark ? DARK_PARTICLE_OPACITY : LIGHT_PARTICLE_OPACITY;
		return { ...baseOpacity, ...(opacityProp || {}) };
	}, [isDark, opacityProp]);

	const size = useMemo(
		() => ({ ...VIBRANT_DEFAULTS.size, ...(sizeProp || {}) }),
		[sizeProp?.min, sizeProp?.max]
	);
	const speed = useMemo(
		() => ({
			x: { ...VIBRANT_DEFAULTS.speed.x, ...(speedProp?.x || {}) },
			y: { ...VIBRANT_DEFAULTS.speed.y, ...(speedProp?.y || {}) },
		}),
		[
			speedProp?.x?.min,
			speedProp?.x?.max,
			speedProp?.y?.min,
			speedProp?.y?.max,
		]
	);

	const specs = useMemo(() => {
		const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
		const activeCount = isMobile && count > 5 ? Math.round(count / 2) : count;
		const midAlpha =
			typeof opacity.mid === 'number' ? opacity.mid : (opacity.center + opacity.edge) / 2;

		return Array.from({ length: activeCount }, (_, i) => {
			const paletteEntry = paletteEntries[i % paletteEntries.length];
			const shape = activeShapes[Math.floor(Math.random() * activeShapes.length)];
			const particleSize = Math.abs(randInRange(size));
			const quadrant = i % 4;

			const background = buildAlphaGradient({
				color: paletteEntry.color,
				centerAlpha: opacity.center,
				midAlpha,
				edgeAlpha: opacity.edge,
			});

			const shapeStyles = getVibrantShapeStyles({ shape, background });

			return {
				particleSize,
				quadrant,
				anchor: buildSpecAnchor(quadrant, i),
				shapeStyles,
				key: i,
			};
		});
	}, [activeShapes, count, opacity, paletteEntries, size.min, size.max]);

	useLayoutEffect(() => {
		if (typeof window === 'undefined') return undefined;
		const skewBox = skewBoxRef.current;
		if (!skewBox) return undefined;

		const bounds = { w: 0, h: 0 };
		let states = [];
		let rafId = null;
		let lastTime = null;
		let resizeTimeout = null;

		const measure = () => {
			const measured = measureBounds(skewBox);
			if (!measured) return false;
			bounds.w = measured.w;
			bounds.h = measured.h;
			return true;
		};

		const initStates = () => {
			states = specs.map((spec, index) => buildParticleState(spec, index, bounds, speed));
		};

		const restartAnimationLoop = () => {
			if (!animate) return;
			if (rafId) window.cancelAnimationFrame(rafId);
			lastTime = null;
			rafId = window.requestAnimationFrame(tick);
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

				applyParticleTransform(particleRefs.current[i], s.x, s.y);
			}
		};

		const tick = now => {
			if (lastTime == null) lastTime = now;
			const dt = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;
			drawFrame(dt * 60);
			rafId = window.requestAnimationFrame(tick);
		};

		const bootstrapAnimation = () => {
			if (!measure()) return false;
			initStates();
			drawFrame(0);
			restartAnimationLoop();
			return true;
		};

		if (!bootstrapAnimation()) {
			rafId = window.requestAnimationFrame(() => {
				bootstrapAnimation();
			});
		}

		const handleResize = () => {
			window.clearTimeout(resizeTimeout);
			resizeTimeout = window.setTimeout(() => {
				if (!measure()) return;
				initStates();
				drawFrame(0);
				restartAnimationLoop();
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
							left: `${spec.anchor.x * 100}%`,
							top: `${spec.anchor.y * 100}%`,
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

export default VibrantHeader;
