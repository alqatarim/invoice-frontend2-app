"use client";

import { useMemo } from "react";

import { styled } from "@mui/material/styles";
import { useSession } from "@/Auth/SessionContext";

import { getSecondsUntilExpiry } from "@/Auth/jwt";
import { userSessionStatusOptions, sessionConfig } from "@/data/dataSets";

const StatusBadge = styled("span")(({ statusColor }) => ({
	width: sessionConfig.badgeSize.width,
	height: sessionConfig.badgeSize.height,
	borderRadius: "50%",
	backgroundColor: statusColor,
	boxShadow: "0 0 0 2px var(--mui-palette-background-paper)",
}));

const getStatusConfig = (statusKey) =>
	userSessionStatusOptions.find((option) => option.key === statusKey) ||
	userSessionStatusOptions.find((option) => option.key === "offline");

const SimpleStatusIndicator = () => {
	const { data: session, status } = useSession();

	const statusInfo = useMemo(() => {
		if (status === "loading") return getStatusConfig("loading");
		if (status === "unauthenticated" || !session?.user) return getStatusConfig("offline");

		const token = session.user.token;
		if (!token) return getStatusConfig("active");

		const secondsUntilExpiry = getSecondsUntilExpiry(token);

		if (secondsUntilExpiry === null) return getStatusConfig("invalid");
		if (secondsUntilExpiry <= 0) return getStatusConfig("expired");
		if (secondsUntilExpiry < sessionConfig.expiryWarningThreshold) {
			return getStatusConfig("expiring");
		}

		return getStatusConfig("active");
	}, [session, status]);

	return (
		<StatusBadge statusColor={statusInfo.color} title={statusInfo.label} />
	);
};

export default SimpleStatusIndicator;
