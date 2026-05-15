// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// Third-party Imports
import classnames from "classnames";

// Component Imports
import CustomAvatar from "@core/components/mui/Avatar";
import { formatCompactNumber } from "@/utils/numberUtils";
import { RiyalIcon } from "@/utils/currencyUtils";
import { useTheme } from "@mui/material/styles";
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
		compactStats = false,
		showRiyalIcon = false,
	} = props;
	const theme = useTheme();
	const formattedStats = compactStats ? formatCompactNumber(stats) : stats ?? 0;

	// Clean up the trend number (remove extra spaces if any)
	const cleanTrendNumber =
		typeof trendNumber === "string" ? trendNumber.trim() : trendNumber || "0%";

	return (
		<Card>
			<CardContent className="flex justify-between items-center">
				<div className="flex flex-col gap-4 flex-between">
					<Typography
						color="text.primary"
						variant="h6"
					// className="font-medium"
					>
						{title}
					</Typography>

					<Box className="flex flex-col justify-start gap-0">
						<Box className="flex flex-row gap-0.5 justify-start items-center">

							{showRiyalIcon ? (
								<RiyalIcon width="1.1rem" color={theme.vars.palette.text.primary} />
							) : null}

							<Typography variant="h4" className="text-[1.2rem] font-semibold">
								{formattedStats}
							</Typography>
						</Box>
						<div className="flex items-center gap-1">
							{trend === "neutral" ? (
								<Typography
									variant="body2"
									fontSize='12.5px'
									color="text.secondary"
									className="font-medium"
								>
									0%
								</Typography>
							) : (
								trend && (
									<Typography
										variant="body2"
										fontSize='12.5px'
										color={trend === "negative" ? "error.main" : "success.main"}
										className="font-medium"
									>
										{trend === "negative" ? "↓" : "↑"} {cleanTrendNumber}
									</Typography>
								)
							)}
							<Typography variant="body2" fontSize='12.5px' color="text.secondary">
								{subtitle}
							</Typography>
						</div>
					</Box>
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
