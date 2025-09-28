"use client";

// React Imports
import { useState, useEffect, useCallback, memo } from "react";

// MUI Imports
import Typography from "@mui/material/Typography";

// Data Imports
import { sessionConfig } from "@/data/dataSets";

// Memoized countdown component to prevent unnecessary parent re-renders
const SessionCountdown = memo(({ token }) => {
	const [timeRemaining, setTimeRemaining] = useState(null);

	// Memoized calculation function to prevent recreating on every render
	const calculateTimeRemaining = useCallback(() => {
		if (!token) {
			return null;
		}

		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			const currentTime = Date.now() / 1000;
			const timeUntilExpiry = payload.exp - currentTime;

			if (timeUntilExpiry <= 0) {
				return "Expired";
			}

			// Convert seconds to hours, minutes, seconds
			const hours = Math.floor(timeUntilExpiry / 3600);
			const minutes = Math.floor((timeUntilExpiry % 3600) / 60);
			const seconds = Math.floor(timeUntilExpiry % 60);

			if (hours > 0) {
				return `${hours}h ${minutes}m ${seconds}s`;
			} else if (minutes > 0) {
				return `${minutes}m ${seconds}s`;
			} else {
				return `${seconds}s`;
			}
		} catch (error) {
			return "Invalid Token";
		}
	}, [token]);

	// Update countdown timer - isolated to this component only
	useEffect(() => {
		const updateTimer = () => {
			setTimeRemaining(calculateTimeRemaining());
		};

		// Initial calculation
		updateTimer();

		// Update using centralized interval
		const interval = setInterval(
			updateTimer,
			sessionConfig.countdownTimer.updateInterval
		);

		return () => clearInterval(interval);
	}, [calculateTimeRemaining]);

	// Don't render if no time remaining calculated
	if (!timeRemaining) {
		return null;
	}

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
						className={`font-mono font-bold ${
							timeRemaining === "Expired" || timeRemaining === "Invalid Token"
								? sessionConfig.countdownTimer.colors.expired
								: timeRemaining.includes("m") &&
								  parseInt(timeRemaining.split("m")[0]) <
										sessionConfig.countdownTimer.warningThreshold
								? sessionConfig.countdownTimer.colors.warning
								: sessionConfig.countdownTimer.colors.normal
						}`}
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
