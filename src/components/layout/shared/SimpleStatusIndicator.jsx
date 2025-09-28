"use client";

// Simple, lightweight status indicator - minimal performance impact
import { useMemo } from "react";
import { styled } from "@mui/material/styles";
import { useSession } from "next-auth/react";

// Data Imports
import { userSessionStatusOptions, sessionConfig } from "@/data/dataSets";

const StatusBadge = styled("span")(({ statusColor }) => ({
	width: sessionConfig.badgeSize.width,
	height: sessionConfig.badgeSize.height,
	borderRadius: "50%",
	backgroundColor: statusColor,
	boxShadow: "0 0 0 2px var(--mui-palette-background-paper)",
}));

// Helper function to get status configuration by key
const getStatusConfig = (statusKey) => {
	return (
		userSessionStatusOptions.find((option) => option.key === statusKey) ||
		userSessionStatusOptions.find((option) => option.key === "offline")
	);
};

const SimpleStatusIndicator = () => {
	const { data: session, status } = useSession();

	// Lightweight status calculation using centralized data sets
	const statusInfo = useMemo(() => {
		// Loading state
		if (status === "loading") {
			return getStatusConfig("loading");
		}

		// No session
		if (status === "unauthenticated" || !session?.user) {
			return getStatusConfig("offline");
		}

		// Check token expiration (simple check, no continuous monitoring)
		if (session.user.token) {
			try {
				const payload = JSON.parse(atob(session.user.token.split(".")[1]));
				const currentTime = Date.now() / 1000;
				const timeUntilExpiry = payload.exp - currentTime;

				// Expired
				if (timeUntilExpiry <= 0) {
					return getStatusConfig("expired");
				}

				// Expiring soon (using centralized threshold)
				if (timeUntilExpiry < sessionConfig.expiryWarningThreshold) {
					return getStatusConfig("expiring");
				}
			} catch (error) {
				return getStatusConfig("invalid");
			}
		}

		// Active session
		return getStatusConfig("active");
	}, [session, status]);

	return (
		<StatusBadge statusColor={statusInfo.color} title={statusInfo.label} />
	);
};

export default SimpleStatusIndicator;
