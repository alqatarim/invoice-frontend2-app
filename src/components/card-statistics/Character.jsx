// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

const CardStatWithImage = (props) => {
	// Props
	const { title, src, stats, trendNumber, trend, chipText, chipColor } = props;

	return (
		<Card className="relative overflow-visible mbs-8">
			<CardContent>
				<Typography color="text.secondary" variant="h6" className="font-medium">
					{title}
				</Typography>
				<Typography variant="h4" className="pbs-4 pbe-1.5">
					{stats}
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
						<Typography
							variant="body2"
							color={trend === "negative" ? "error.main" : "success.main"}
							className="font-medium"
						>
							{trend === "negative" ? "↓" : "↑"} {trendNumber}
						</Typography>
					)}
					<Typography variant="body2" color="text.secondary">
						{chipText}
					</Typography>
				</div>
				<img
					src={src}
					alt={title}
					className="absolute block-end-0 inline-end-4 bs-44"
				/>
			</CardContent>
		</Card>
	);
};

export default CardStatWithImage;
