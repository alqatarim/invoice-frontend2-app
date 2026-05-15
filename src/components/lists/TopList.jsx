import { Avatar, Box, Card, CardContent, CardHeader, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import CustomAvatar from "@core/components/mui/Avatar";
import { RiyalIcon } from "@/utils/currencyUtils";

const DEFAULT_EMPTY_STATE = {
	icon: "ri-inbox-line",
	text: "No data available.",
	color: "secondary",
};

const TopList = ({
	title,
	items = [],
	maxItems = 5,
	tabs = [],
	activeTab,
	onTabChange,
	toggleColor = "primary",
	getKey = (item, index) => `${item?.name}-${index}`,
	listSpacing = 1.5,
	getAvatarContent = (_item, index) => index + 1,
	getAvatarColor,
	getName = (item) => item?.name || "Item",
	getSubtitle,
	getValue,
	showRiyalIcon = false,
	getMeta,
	getMetaColor,
}) => {
	const theme = useTheme();
	const defaultAccentColor = theme.palette[toggleColor]?.main || theme.palette.primary.main;
	const visibleItems = items.slice(0, maxItems);

	return (
		<Card sx={{ height: "100%" }}>
			<CardHeader
				title={<Typography variant="h5">{title}</Typography>}
				action={
					tabs.length > 0 && (
						<ToggleButtonGroup
							color={toggleColor}
							size="small"
							exclusive
							value={activeTab}
							onChange={onTabChange}
						>
							{tabs.map((tab) => (
								<ToggleButton key={tab.value} value={tab.value}>
									{tab.label}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					)
				}
			/>
			<CardContent sx={{ pt: 0 }}>
				<Stack spacing={listSpacing}>
					{visibleItems.length === 0 ? (
						<Box
							sx={{
								py: 6,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 1,
							}}
						>
							<CustomAvatar size={40} skin="light" color={DEFAULT_EMPTY_STATE.color} variant="rounded">
								<Icon icon={DEFAULT_EMPTY_STATE.icon} width={20} />
							</CustomAvatar>
							<Typography variant="body2" color="text.secondary">
								{DEFAULT_EMPTY_STATE.text}
							</Typography>
						</Box>
					) : (
						visibleItems.map((item, index) => {
							const avatarColor = getAvatarColor?.(item, index) || defaultAccentColor;
							const subtitle = getSubtitle?.(item, index);
							const value = getValue?.(item, index);
							const meta = getMeta?.(item, index);
							const metaColor = getMetaColor?.(item, index);
							const hasValue = value !== undefined && value !== null && value !== "";
							const hasMeta = meta !== undefined && meta !== null && meta !== "";

							const nameLabel = getName(item, index);

							return (
								<Box
									key={getKey(item, index)}
									sx={{
										py: 2,
										px: 1,
										borderBottom:
											index < visibleItems.length - 1
												? `1px solid ${alpha(theme.palette.divider, 0.6)}`
												: "none",
										transition: "background-color 0.15s ease",
										"&:hover": {
											backgroundColor: alpha(theme.palette.action.hover, 0.04),
										},
									}}
								>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={1.5}
										sx={{ width: "100%", minWidth: 0 }}
									>
										<Stack
											direction="row"
											spacing={2}
											alignItems="center"
											sx={{ minWidth: 0, flex: "1 1 auto" }}
										>
											<Avatar
												variant="rounded"
												sx={{
													width: 28,
													height: 28,
													flexShrink: 0,
													fontSize: "0.75rem",
													fontWeight: 600,
													bgcolor: alpha(avatarColor, 0.1),
													color: avatarColor,
													borderRadius: "50%",
												}}
											>
												{getAvatarContent(item, index)}
											</Avatar>
											<Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
												<Tooltip
													title={typeof nameLabel === "string" ? nameLabel : ""}
													placement="top"
													arrow
													disableInteractive
												>
													<Typography
														variant="h6"
														sx={{
															fontSize: "0.875rem",
															lineHeight: 1.3,
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
															display: "block",
														}}
													>
														{nameLabel}
													</Typography>
												</Tooltip>
												{subtitle ? (
													<Typography
														variant="caption"
														sx={{
															display: "block",
															fontSize: "0.75rem",
															color: "text.secondary",
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
													>
														{subtitle}
													</Typography>
												) : null}
											</Box>
										</Stack>
										{(hasValue || hasMeta) ? (
											<Stack
												spacing={0.2}
												sx={{
													flexShrink: 0,
													alignItems: "flex-end",
													textAlign: "right",
												}}
											>
												{hasValue ? (
													<Stack
														direction="row"
														alignItems="center"
														spacing={0.5}
														sx={{ flexShrink: 0 }}
													>
														{showRiyalIcon ? (
															<Box
																component="span"
																sx={{
																	display: "inline-flex",
																	alignItems: "center",
																	color: "text.secondary",
																}}
															>
																<RiyalIcon width="0.85rem" color="currentColor" />
															</Box>
														) : null}
														<Typography
															variant="h6"
															sx={{
																fontSize: "0.875rem",
																fontWeight: 700,
																lineHeight: 1.2,
															}}
														>
															{value}
														</Typography>
													</Stack>
												) : null}
												{hasMeta ? (
													<Typography
														variant="caption"
														sx={{
															fontWeight: 600,
															fontSize: "0.7rem",
															lineHeight: 1.2,
															...(metaColor ? { color: metaColor } : {}),
														}}
													>
														{meta}
													</Typography>
												) : null}
											</Stack>
										) : null}
									</Stack>
								</Box>
							);
						})
					)}
				</Stack>
			</CardContent>
		</Card>
	);
};

export default TopList;
