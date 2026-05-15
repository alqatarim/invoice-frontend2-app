// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

// Component Imports
import Avatar from '@/components/avatar/Avatar'
import { CountUp } from '@/views/dashboard/CountUp'
import { formatCompactNumber } from '@/utils/numberUtils'

const HorizontalWithoutBorder = ({
	title,
	subtitle,
	value,
	stats,
	icon,
	avatarIcon,
	color = 'primary',
	formatter = formatCompactNumber,
}) => {
	const theme = useTheme()
	const displayValue = value ?? stats ?? 0
	const displayIcon = icon || avatarIcon
	const iconColor = theme.palette[color]?.main || theme.palette.primary.main

	return (
		<Card
			component={motion.div}
			variant='outlined'
			className='border border-0 bg-transparent'
		>
			<CardContent className='py-3 px-4'>
				<Box className='flex flex-row justify-start gap-3'>
					<Avatar
						variant='rounded'
						skin='light'
						size={55}
						// src={displayIcon}
						color={color}
					>
						<Icon icon={displayIcon} width='2.1rem' color={iconColor} />
					</Avatar>

					<Box className='flex flex-col items-start justify-between '>
						<Typography
							variant='overline'
							color='text.secondary'
							className='tracking-[0.4px] uppercaseleading-0 font-semibold text-[0.8rem]'
						>
							{title}
						</Typography>

						<Box className='flex flex-row items-end justify-start gap-1'>
							<Typography
								sx={{
									display: 'flex',
									fontSize: '1.8rem',
									fontWeight: 700,
									lineHeight: 1,
									letterSpacing: '-0.025em',
									color: 'text.primary',
									fontVariantNumeric: 'tabular-nums',
								}}
								color={iconColor}
							>
								<CountUp value={displayValue} formatter={formatter} />

							</Typography>
							<Typography


								variant='h6'
								color='text.secondary'
								className='tracking-[0.2px] text-[0.8rem]'

								sx={{

									fontVariantNumeric: 'tabular-nums',
								}}
							>
								{subtitle}
							</Typography>
						</Box>

					</Box>

				</Box>
			</CardContent>
		</Card>
	)
}

export default HorizontalWithoutBorder
