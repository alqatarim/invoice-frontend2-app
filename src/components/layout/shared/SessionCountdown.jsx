"use client";

import { useCallback, useEffect, useState, memo } from "react";

import Typography from "@mui/material/Typography";

import { formatTimeRemaining } from "@/Auth/tokenUtils";
import { sessionConfig } from "@/data/dataSets";

const SessionCountdown = memo(({ token }) => {
	const [timeRemaining, setTimeRemaining] = useState(() =>
		formatTimeRemaining(token)
	);

	const updateTimer = useCallback(() => {
		setTimeRemaining(formatTimeRemaining(token));
	}, [token]);

	useEffect(() => {
		updateTimer();

		const interval = setInterval(
			updateTimer,
			sessionConfig.countdownTimer.updateInterval
		);

		return () => clearInterval(interval);
	}, [updateTimer]);

	if (!timeRemaining) return null;

	const isExpiredOrInvalid =
		timeRemaining === "Expired" || timeRemaining === "Invalid Token";
	const minutesPart = timeRemaining.includes("m")
		? parseInt(timeRemaining.split("m")[0], 10)
		: NaN;
	const isWarning =
		!isExpiredOrInvalid &&
		Number.isFinite(minutesPart) &&
		minutesPart < sessionConfig.countdownTimer.warningThreshold;

	const colorClass = isExpiredOrInvalid
		? sessionConfig.countdownTimer.colors.expired
		: isWarning
			? sessionConfig.countdownTimer.colors.warning
			: sessionConfig.countdownTimer.colors.normal;

	return (
		<div
			className={`flex items-center plb-2 pli-4 gap-2 ${sessionConfig.countdownTimer.background}`}
		>
			<div className="flex items-center gap-2">
				<i className="ri-time-line text-[16px] text-primary" />
				<div className="flex flex-col">
					<Typography variant="caption" className="font-medium text-primary">
						Session Expires In:
					</Typography>
					<Typography
						variant="body2"
						className={`font-mono font-bold ${colorClass}`}
					>
						{timeRemaining}
					</Typography>
				</div>
			</div>
		</div>
	);
});

SessionCountdown.displayName = "SessionCountdown";

export default SessionCountdown;
