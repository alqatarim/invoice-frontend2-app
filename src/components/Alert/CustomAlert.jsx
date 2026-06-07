'use client';

import Alert from '@mui/material/Alert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { useTheme } from '@mui/material/styles';

/** Default-style MUI outlined icons (overrides theme Remix iconMapping). */
const MUI_DEFAULT_ICON_MAPPING = {
     success: <CheckCircleOutlineIcon fontSize="inherit" />,
     warning: <ReportProblemOutlinedIcon fontSize="inherit" />,
     error: <ErrorOutlineIcon fontSize="inherit" />,
     info: <InfoOutlinedIcon fontSize="inherit" />,
};

const SIZE_ALIASES = {
     small: 'sm',
     medium: 'md',
     large: 'lg',
};

const VALID_SIZES = new Set(['xs', 'sm', 'md', 'lg']);
const VALID_SKINS = new Set(['normal', 'light', 'lighter', 'lightest']);
const VALID_SEVERITIES = new Set(['error', 'warning', 'info', 'success']);

const SIZE_STYLES = {
     xs: {
          padding: '5px 16px',
          gap: '16px',
          fontSize: '0.75rem',
          lineHeight: 1.4,
          iconBox: 20,
          iconFontSize: 17,
     },
     sm: {
          padding: '9px 13px',
          gap: '8px',
          fontSize: '0.8125rem',
          lineHeight: 1.45,
          iconBox: 21,
          iconFontSize: 21,
     },
     md: {
          padding: '12px 18px',
          gap: '12px',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          iconBox: 23,
          iconFontSize: 23,
     },
     lg: {
          padding: null,
          gap: null,
          fontSize: null,
          lineHeight: null,
          iconBox: 27,
          iconFontSize: 27,
     },
};

export const normalizeCustomAlertSize = (size = 'lg') => {
     const normalized = SIZE_ALIASES[size] || size;
     return VALID_SIZES.has(normalized) ? normalized : 'lg';
};

export const normalizeCustomAlertSkin = (skin = 'normal') =>
     VALID_SKINS.has(skin) ? skin : 'normal';

const resolveSeverityKey = severity =>
     VALID_SEVERITIES.has(severity) ? severity : 'info';

const resolveSeverityPalette = (theme, severity) => {
     return theme.palette[resolveSeverityKey(severity)];
};

/** Prefer `darker`; fall back to `dark` and theme CSS vars (light scheme lacked `darker` before). */
const resolveAlertContentColor = (theme, severity) => {
     const key = resolveSeverityKey(severity);
     const palette = theme.palette[key];
     const darker = palette?.darker;
     const dark = palette?.dark;

     if (darker) {
          return darker;
     }

     if (dark) {
          return dark;
     }

     return `var(--mui-palette-${key}-darker, var(--mui-palette-${key}-dark))`;
};

const resolveSkinBackground = (palette, skin) => {
     switch (skin) {
          case 'light':
               return palette.lightOpacity;
          case 'lighter':
               return palette.lighterOpacity;
          case 'lightest':
               return palette.lightestOpacity;
          default:
               return undefined;
     }
};

const buildCustomAlertSx = (theme, { size, skin, severity }) => {
     const palette = resolveSeverityPalette(theme, severity);
     const sizeStyles = SIZE_STYLES[size];
     const backgroundColor = resolveSkinBackground(palette, skin);
     const useCustomSkin = skin !== 'normal' && backgroundColor;
     const contentColor = resolveAlertContentColor(theme, severity);

     const sx = {
          ...(sizeStyles.padding != null ? { padding: sizeStyles.padding } : {}),
          ...(sizeStyles.gap != null ? { gap: sizeStyles.gap } : {}),
          ...(sizeStyles.fontSize != null
               ? {
                    fontSize: sizeStyles.fontSize,
                    lineHeight: sizeStyles.lineHeight,
               }
               : {}),
          ...(useCustomSkin
               ? {
                    backgroundColor,
                    color: contentColor,
               }
               : { color: contentColor }),
          // MUI standard Alert sets root/message color from palette.main — override for custom skins.
          '&.MuiAlert-standard': {
               color: contentColor,
          },
          '& .MuiAlert-icon': {
               minWidth: sizeStyles.iconBox,
               width: sizeStyles.iconBox,
               height: sizeStyles.iconBox,
               padding: 0,
               margin: 0,
               borderRadius: 0,
               backgroundColor: 'transparent',
               boxShadow: 'none',
               color: contentColor,
               alignItems: 'center',
               justifyContent: 'center',
               flexShrink: 0,
               '& svg': {
                    fontSize: sizeStyles.iconFontSize,
                    width: '1em',
                    height: '1em',
               },
          },
          '& .MuiAlert-message': {
               padding: 0,
               fontWeight: 450,
               letterSpacing: 0.2,
               color: contentColor,
               ...(sizeStyles.fontSize != null ? { fontSize: sizeStyles.fontSize } : {}),
          },
     };

     return sx;
};

/**
 * MUI Alert wrapper with `size` and `skin` variants.
 *
 * @param {'xs'|'sm'|'small'|'md'|'medium'|'lg'|'large'} [size='lg'] - lg matches default theme alert sizing.
 * @param {'normal'|'light'|'lighter'|'lightest'} [skin='normal'] - background from severity palette.
 */
const CustomAlert = ({
     size = 'lg',
     skin = 'normal',
     severity = 'info',
     variant = 'standard',
     iconMapping,
     sx,
     ...rest
}) => {
     const theme = useTheme();
     const normalizedSize = normalizeCustomAlertSize(size);
     const normalizedSkin = normalizeCustomAlertSkin(skin);
     const customSx = buildCustomAlertSx(theme, {
          size: normalizedSize,
          skin: normalizedSkin,
          severity,
     });

     return (
          <Alert
               severity={severity}
               variant={variant}
               iconMapping={iconMapping ?? MUI_DEFAULT_ICON_MAPPING}
               sx={[customSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
               {...rest}
          />
     );
};

export default CustomAlert;
