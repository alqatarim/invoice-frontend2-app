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
import { CountUp } from '@/views/dashboard/components/CountUp'
import { RiyalIcon } from '@/utils/currencyUtils'
import { formatCompactNumber } from '@/utils/numberUtils'

const parseDisplayValue = value => {
	if (typeof value === 'number') {
		return {
			value,
			isNumeric: Number.isFinite(value),
			prefix: '',
			suffix: '',
		}
	}

	const rawValue = String(value ?? '').trim()
	const numericValue = Number(rawValue.replace(/,/g, ''))

	if (Number.isFinite(numericValue)) {
		return {
			value: numericValue,
			isNumeric: true,
			prefix: '',
			suffix: '',
		}
	}

	const formattedAmountMatch = rawValue.match(/^([^0-9-]*)(-?[0-9][0-9,]*(?:\.\d+)?)(.*)$/)

	if (formattedAmountMatch) {
		const amountFromFormattedText = Number(formattedAmountMatch[2].replace(/,/g, ''))

		return {
			value: amountFromFormattedText,
			isNumeric: Number.isFinite(amountFromFormattedText),
			prefix: formattedAmountMatch[1],
			suffix: formattedAmountMatch[3],
		}
	}

	return {
		value,
		isNumeric: false,
		prefix: '',
		suffix: '',
	}
}

const HorizontalWithoutBorder = ({
	title,
	subtitle,
	value,
	stats,
	icon,
	avatarIcon,
	color = 'primary',
	formatter = formatCompactNumber,
	isCurrency = false,
	currencyIconWidth = '1.1rem',
	compact = false,
}) => {
	const theme = useTheme()
	const rawDisplayValue = value ?? stats ?? 0
	const displayValue = parseDisplayValue(rawDisplayValue)
	const displayIcon = icon || avatarIcon
	const iconColor = theme.palette[color]?.main || theme.palette.primary.main
	const hasCurrencyPrefix = /(\$|﷼|SAR|Saudi Riyal)/i.test(displayValue.prefix || '')
	const shouldShowCurrencyIcon = isCurrency || hasCurrencyPrefix
	const valueFormatter = currentValue =>
		shouldShowCurrencyIcon
			? (formatter || formatCompactNumber)(currentValue)
			: `${displayValue.prefix}${(formatter || formatCompactNumber)(currentValue)}${displayValue.suffix}`

	return (
		<Card
			component={motion.div}
			variant='outlined'
			className='border border-0 bg-transparent'
		>
			<CardContent className={compact ? 'py-2 px-3' : 'py-3 px-4'}>
				<Box className='flex flex-row justify-start gap-3'>
					<Avatar
						variant='rounded'
						skin='light'
						size={compact ? 44 : 55}
						color={color}
					>
						<Icon icon={displayIcon} width={compact ? '1.6rem' : '2.1rem'} color={iconColor} />
					</Avatar>

					<Box className='flex flex-col items-start justify-between '>
						<Typography
							variant='overline'
							color='text.secondary'
							className='tracking-[0.4px] uppercaseleading-0 font-semibold text-[0.8rem] '
						>
							{title}
						</Typography>

						<Box className='flex flex-row items-end justify-start gap-0.5'>

							{shouldShowCurrencyIcon ? (
								<RiyalIcon width={currencyIconWidth} color={theme.palette.text.primary} />
							) : null}
							<Typography
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 0.5,
									fontSize: compact ? { xs: '1.35rem', sm: '1.8rem' } : '1.8rem',
									fontWeight: 700,
									lineHeight: 0.8,
									letterSpacing: '-0.025em',
									color: 'text.primary',
									fontVariantNumeric: 'tabular-nums',
								}}
								color={iconColor}
							>
								{displayValue.isNumeric ? (
									<CountUp value={displayValue.value} formatter={valueFormatter} />
								) : (
									displayValue.value
								)}
							</Typography>
							<Typography
								variant='h6'
								color='text.secondary'
								lineHeight={0.8}
								className='tracking-[0.2px] text-[0.8rem] ml-0.5 tabular-nums'
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
