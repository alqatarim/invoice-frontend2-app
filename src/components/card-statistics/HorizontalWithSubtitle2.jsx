// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

// Third-party Imports
import classnames from "classnames";

// Component Imports
import CustomAvatar from "@core/components/mui/Avatar";

const HorizontalWithSubtitle2 = (props) => {
	// Props
	const {
		title,
		stats,
		avatarIcon,
		avatarColor,
		trend,
		trendNumber,
		subtitle,
		symbol = "",
	} = props;

	// Format the stats value - ensure it's a valid number or string
	const formattedStats = stats !== undefined && stats !== null ? stats : 0;

	// Clean up the trend number (remove extra spaces if any)
	const cleanTrendNumber =
		typeof trendNumber === "string" ? trendNumber.trim() : trendNumber || "0 %";

	return (
		<Card>
			<CardContent className="flex justify-between gap-1">
				<div className="flex flex-col gap-1 flex-grow">
					<Typography
						color="text.secondary"
						variant="h6"
						// className="font-medium"
					>
						{title}
					</Typography>
					<Typography variant="h5" className="font-semibold">
						{formattedStats}
						{symbol}
					</Typography>
					<div className="flex items-center gap-1">
						{trend === "neutral" ? (
							<Typography
								variant="body2"
								color="text.primary"
								className="font-medium"
							>
								0 %
							</Typography>
						) : (
							trend && (
								<Typography
									variant="body2"
									color={trend === "negative" ? "error.main" : "success.main"}
									className="font-medium"
								>
									{trend === "negative" ? "↓" : "↑"} {cleanTrendNumber}
								</Typography>
							)
						)}
						<Typography variant="body2" color="text.secondary">
							{subtitle}
						</Typography>
					</div>
				</div>
				<CustomAvatar
					color={avatarColor}
					skin="light"
					variant="rounded"
					size={42}
				>
					<i className={classnames(avatarIcon, "text-[26px]")} />
				</CustomAvatar>
			</CardContent>
		</Card>
	);
};

export default HorizontalWithSubtitle2;
