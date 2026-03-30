"use client";

// React Imports
import { useRef, useState } from "react";

// Next Imports
import { useParams, useRouter } from "next/navigation";

// MUI Imports
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

// Third-party Imports
import { signOut, useSession } from "next-auth/react";

// Hook Imports
import { useSettings } from "@core/hooks/useSettings";

// Component Imports
import SimpleStatusIndicator from "./SimpleStatusIndicator";
import SessionCountdown from "./SessionCountdown";

// Util Imports
import { getLocalizedUrl } from "@/utils/i18n";

const UserDropdown = () => {
	// States
	const [open, setOpen] = useState(false);

	// Refs
	const anchorRef = useRef(null);

	// Hooks
	const router = useRouter();
	const { data: session } = useSession();
	const { settings } = useSettings();
	const { lang: locale } = useParams();
	const companyMembership = session?.user?.companyMembership || {};
	const accessibleBranches = Array.isArray(companyMembership?.accessibleBranches)
		? companyMembership.accessibleBranches
		: [];
	const primaryBranch = accessibleBranches.find((branch) =>
		[String(branch?.branchId || ''), String(branch?._id || '')].includes(
			String(companyMembership?.primaryBranchId || '')
		)
	);
	const companyName = session?.user?.companyDetails?.companyName || '';

	const handleDropdownOpen = () => {
		!open ? setOpen(true) : setOpen(false);
	};

	const handleDropdownClose = (event, url) => {
		if (url) {
			router.push(getLocalizedUrl(url, locale));
		}

		if (anchorRef.current && anchorRef.current.contains(event?.target)) {
			return;
		}

		setOpen(false);
	};

	const handleUserLogout = async () => {
		try {
			// Sign out from the app
			await signOut({ redirect: false });

			// Redirect to login page
			router.push(getLocalizedUrl("/login", locale));
		} catch (error) {
			console.error(error);

			// Show above error in a toast like following
			// toastService.error((err as Error).message)
		}
	};

	return (
		<>
			<Badge
				ref={anchorRef}
				overlap="circular"
				badgeContent={<SimpleStatusIndicator />}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				className="mis-2"
			>
				<Avatar
					ref={anchorRef}
					alt={session?.user?.name || ""}
					src={session?.user?.image || ""}
					onClick={handleDropdownOpen}
					className="cursor-pointer bs-[38px] is-[38px]"
				/>
			</Badge>
			<Popper
				open={open}
				transition
				disablePortal
				placement="bottom-end"
				anchorEl={anchorRef.current}
				className="min-is-[240px] !mbs-4 z-[1]"
			>
				{({ TransitionProps, placement }) => (
					<Fade
						{...TransitionProps}
						style={{
							transformOrigin:
								placement === "bottom-end" ? "right top" : "left top",
						}}
					>
						<Paper
							className={
								settings.skin === "bordered"
									? "border shadow-none"
									: "shadow-lg"
							}
						>
							<ClickAwayListener onClickAway={(e) => handleDropdownClose(e)}>
								<MenuList>
									<div
										className="flex items-center plb-2 pli-4 gap-2"
										tabIndex={-1}
									>
										<Avatar
											alt={session?.user?.name || ""}
											src={session?.user?.image || ""}
										/>
										<div className="flex items-start flex-col">
											<Typography className="font-medium" color="text.primary">
												{session?.user?.name || ""}
											</Typography>
											<Typography variant="caption">
												{session?.user?.email || ""}
											</Typography>
											{companyName ? (
												<Typography variant="caption" color="text.secondary">
													{companyName}
												</Typography>
											) : null}
										</div>
									</div>
									<Box className="flex flex-wrap gap-2 px-4 pb-2">
										{companyMembership?.orgRole ? (
											<Chip
												size="small"
												variant="outlined"
												label={companyMembership.orgRole.replaceAll("_", " ")}
											/>
										) : null}
										<Chip
											size="small"
											variant="outlined"
											label={`${accessibleBranches.length} accessible locations`}
										/>
										{primaryBranch?.name ? (
											<Chip
												size="small"
												color="primary"
												variant="tonal"
												label={`Primary: ${primaryBranch.name}`}
											/>
										) : null}
									</Box>

									{/* Session Expiry Countdown Timer for Testing */}
									<SessionCountdown token={session?.user?.token} />

									<Divider className="mlb-1" />
									<MenuItem
										className="gap-3"
										onClick={(e) => handleDropdownClose(e, "/profile")}
									>
										<i className="ri-user-3-line text-[22px]" />
										<Typography color="text.primary">My Profile</Typography>
									</MenuItem>
									<MenuItem
										className="gap-3"
										onClick={(e) => handleDropdownClose(e, "/settings")}
									>
										<i className="ri-settings-4-line text-[22px]" />
										<Typography color="text.primary">Settings</Typography>
									</MenuItem>
									{/* <MenuItem
										className="gap-3"
										onClick={(e) => handleDropdownClose(e, "/pages/pricing")}
									>
										<i className="ri-money-dollar-circle-line text-[22px]" />
										<Typography color="text.primary">Pricing</Typography>
									</MenuItem> */}
									{/* <MenuItem
										className="gap-3"
										onClick={(e) => handleDropdownClose(e, "/pages/faq")}
									>
										<i className="ri-question-line text-[22px]" />
										<Typography color="text.primary">FAQ</Typography>
									</MenuItem> */}
									<div className="flex items-center plb-2 pli-4">
										<Button
											fullWidth
											variant="contained"
											color="error"
											size="small"
											endIcon={<i className="ri-logout-box-r-line" />}
											onClick={handleUserLogout}
											sx={{
												"& .MuiButton-endIcon": { marginInlineStart: 1.5 },
											}}
										>
											Logout
										</Button>
									</div>
								</MenuList>
							</ClickAwayListener>
						</Paper>
					</Fade>
				)}
			</Popper>
		</>
	);
};

export default UserDropdown;
