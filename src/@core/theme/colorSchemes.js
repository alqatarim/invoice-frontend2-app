const colorSchemes = skin => {
  return {
    light: {
      palette: {
        primary: {
          main: '#8C57FF',
          light: '#A379FF',
          dark: '#7E4EE6',

           lighter: '#C3A6FF', // real lighter hex
          lightest: '#E3DBFF', // real lightest hex
     
          lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.11)',
          lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
          lightestOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.06)',
          mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)',
          darkestOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.42)'
        },
        secondary: {
          main: '#8A8D93',
          light: '#A1A4A9',
          dark: '#7C7F84',
          lighter: '#C2C4C8', // real lighter hex
          lightest: '#E3E4E6', // real lightest hex
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.11)',
          lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
          lightestOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.06)',
          mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)',
          darkestOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.42)'
        },
        error: {
          main: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
          lighter: '#FFB3B5', // real lighter hex
          lightest: '#FFE5E6', // real lightest hex
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.11)',
          lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
          lightestOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.06)',
          mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)',
          darkestOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.42)'
        },
        warning: {
          main: '#FFB400',
          light: '#FFC333',
          dark: '#E6A200',
          lighter: '#FFE099', // real lighter hex
          lightest: '#FFF7E0', // real lightest hex
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.11)',
          lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
          lightestOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.06)',
          mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)',
          darkestOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.42)',

        },
        info: {
          main: '#16B1FF',
          light: '#45C1FF',
          dark: '#149FE6',
          lighter: '#99DBFF', // real lighter hex
          lightest: '#E0F5FF', // real lightest hex
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.11)',
          lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
          lightestOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.06)',
          mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)',
          darkestOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.42)'
        },
        success: {
          main: '#56CA00',
          light: '#78D533',
          dark: '#4DB600',
          lighter: '#B6F399', // real lighter hex
          lightest: '#E9FFD9', // real lightest hex
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.11)',
          lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
          lightestOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.06)',
          mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)',
          darkestOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.42)'
        },
        text: {
          primary: `rgb(var(--mui-mainColorChannels-light) / 0.9)`,
          secondary: `rgb(var(--mui-mainColorChannels-light) / 0.7)`,
          disabled: `rgb(var(--mui-mainColorChannels-light) / 0.4)`,
          primaryChannel: 'var(--mui-mainColorChannels-light)',
          secondaryChannel: 'var(--mui-mainColorChannels-light)'
        },
        divider: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
        dividerChannel: 'var(--mui-mainColorChannels-light)',
        background: {
          default: skin === 'bordered' ? '#FFFFFF' : '#F4F5FA',
          paper: '#FFFFFF',
          paperChannel: '255 255 255'
        },
        action: {
          active: `rgb(var(--mui-mainColorChannels-light) / 0.6)`,
          hover: `rgb(var(--mui-mainColorChannels-light) / 0.04)`,
          selected: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
          disabled: `rgb(var(--mui-mainColorChannels-light) / 0.3)`,
          disabledBackground: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
          focus: `rgb(var(--mui-mainColorChannels-light) / 0.1)`,
          focusOpacity: 0.1,
          activeChannel: 'var(--mui-mainColorChannels-light)',
          selectedChannel: 'var(--mui-mainColorChannels-light)'
        },
        Alert: {
          errorColor: 'var(--mui-palette-error-main)',
          warningColor: 'var(--mui-palette-warning-main)',
          infoColor: 'var(--mui-palette-info-main)',
          successColor: 'var(--mui-palette-success-main)',
          errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
          warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
          infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
          successStandardBg: 'var(--mui-palette-success-lightOpacity)',
          errorFilledColor: 'var(--mui-palette-error-contrastText)',
          warningFilledColor: 'var(--mui-palette-warning-contrastText)',
          infoFilledColor: 'var(--mui-palette-info-contrastText)',
          successFilledColor: 'var(--mui-palette-success-contrastText)',
          errorFilledBg: 'var(--mui-palette-error-main)',
          warningFilledBg: 'var(--mui-palette-warning-main)',
          infoFilledBg: 'var(--mui-palette-info-main)',
          successFilledBg: 'var(--mui-palette-success-main)'
        },
        Avatar: {
          defaultBg: '#F0EFF0'
        },
        Chip: {
          defaultBorder: 'var(--mui-palette-divider)'
        },
        FilledInput: {
          bg: `rgb(var(--mui-mainColorChannels-light) / 0.06)`,
          hoverBg: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
          disabledBg: `rgb(var(--mui-mainColorChannels-light) / 0.06)`
        },
        LinearProgress: {
          primaryBg: 'var(--mui-palette-primary-mainOpacity)',
          secondaryBg: 'var(--mui-palette-secondary-mainOpacity)',
          errorBg: 'var(--mui-palette-error-mainOpacity)',
          warningBg: 'var(--mui-palette-warning-mainOpacity)',
          infoBg: 'var(--mui-palette-info-mainOpacity)',
          successBg: 'var(--mui-palette-success-mainOpacity)'
        },
        SnackbarContent: {
          bg: '#1A0E33',
          color: 'var(--mui-palette-background-paper)'
        },
        Switch: {
          defaultColor: 'var(--mui-palette-common-white)',
          defaultDisabledColor: 'var(--mui-palette-common-white)',
          primaryDisabledColor: 'var(--mui-palette-common-white)',
          secondaryDisabledColor: 'var(--mui-palette-common-white)',
          errorDisabledColor: 'var(--mui-palette-common-white)',
          warningDisabledColor: 'var(--mui-palette-common-white)',
          infoDisabledColor: 'var(--mui-palette-common-white)',
          successDisabledColor: 'var(--mui-palette-common-white)'
        },
        Tooltip: {
          bg: '#1A0E33'
        },
        TableCell: {
          border: 'var(--mui-palette-divider)'
        },
        customColors: {
          bodyBg: '#F4F5FA',
          chatBg: '#F7F6FA',
          greyLightBg: '#FAFAFA',
          inputBorder: `rgb(var(--mui-mainColorChannels-light) / 0.22)`,
          tableHeaderBg: '#F6F7FB',
          tooltipText: '#FFFFFF',
          trackBg: '#F0F2F8'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#8C57FF',
          light: '#A379FF',
          dark: '#7E4EE6',
          lighter: '#BFA6FF', // real lighter hex
          lightest: '#E5DBFF', // real lightest hex
          darker: '#A37FFF',
          darkest: '#8C57FF',
          lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
        },
        secondary: {
          main: '#8A8D93',
          light: '#A1A4A9',
          dark: '#7C7F84',
          lighter: '#B0B3B8', // real lighter hex
          lightest: '#E0E1E2', // real lightest hex
          darker: '#A1A4A9',
          darkest: '#8A8D93',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
        },
        error: {
          main: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
          lighter: '#FFB3B5', // real lighter hex
          lightest: '#FFE5E6', // real lightest hex
          darker: '#FF7074',
          darkest: '#FF4C51',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
        },
        warning: {
          main: '#FFB400',
          light: '#FFC333',
          dark: '#E6A200',
          lighter: '#FFE099', // real lighter hex
          lightest: '#FFF7E0', // real lightest hex
          darker: '#FFC333',
          darkest: '#FFB400',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
        },
        info: {
          main: '#16B1FF',
          light: '#45C1FF',
          dark: '#149FE6',
          lighter: '#99DBFF', // real lighter hex
          lightest: '#E0F5FF', // real lightest hex
          darker: '#45C1FF',
          darkest: '#16B1FF',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
        },
        success: {
          main: '#56CA00',
          light: '#78D533',
          dark: '#4DB600',
          lighter: '#B6F399', // real lighter hex
          lightest: '#E9FFD9', // real lightest hex
          darker: '#78D533',
          darkest: '#56CA00',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)'
        },
        text: {
          primary: `rgb(var(--mui-mainColorChannels-dark) / 0.9)`,
          secondary: `rgb(var(--mui-mainColorChannels-dark) / 0.7)`,
          disabled: `rgb(var(--mui-mainColorChannels-dark) / 0.4)`,
          primaryChannel: 'var(--mui-mainColorChannels-dark)',
          secondaryChannel: 'var(--mui-mainColorChannels-dark)'
        },
        divider: `rgb(var(--mui-mainColorChannels-dark) / 0.12)`,
        dividerChannel: 'var(--mui-mainColorChannels-dark)',
        background: {
          default: skin === 'bordered' ? '#312D4B' : '#28243D',
          paper: '#312D4B',
          paperChannel: '49 45 75'
        },
        action: {
          active: `rgb(var(--mui-mainColorChannels-dark) / 0.6)`,
          hover: `rgb(var(--mui-mainColorChannels-dark) / 0.04)`,
          selected: `rgb(var(--mui-mainColorChannels-dark) / 0.08)`,
          disabled: `rgb(var(--mui-mainColorChannels-dark) / 0.3)`,
          disabledBackground: `rgb(var(--mui-mainColorChannels-dark) / 0.12)`,
          focus: `rgb(var(--mui-mainColorChannels-dark) / 0.1)`,
          focusOpacity: 0.1,
          activeChannel: 'var(--mui-mainColorChannels-dark)',
          selectedChannel: 'var(--mui-mainColorChannels-dark)'
        },
        Alert: {
          errorColor: 'var(--mui-palette-error-main)',
          warningColor: 'var(--mui-palette-warning-main)',
          infoColor: 'var(--mui-palette-info-main)',
          successColor: 'var(--mui-palette-success-main)',
          errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
          warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
          infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
          successStandardBg: 'var(--mui-palette-success-lightOpacity)',
          errorFilledColor: 'var(--mui-palette-error-contrastText)',
          warningFilledColor: 'var(--mui-palette-warning-contrastText)',
          infoFilledColor: 'var(--mui-palette-info-contrastText)',
          successFilledColor: 'var(--mui-palette-success-contrastText)',
          errorFilledBg: 'var(--mui-palette-error-main)',
          warningFilledBg: 'var(--mui-palette-warning-main)',
          infoFilledBg: 'var(--mui-palette-info-main)',
          successFilledBg: 'var(--mui-palette-success-main)'
        },
        Avatar: {
          defaultBg: '#3F3B59'
        },
        Chip: {
          defaultBorder: 'var(--mui-palette-divider)'
        },
        FilledInput: {
          bg: `rgb(var(--mui-mainColorChannels-dark) / 0.06)`,
          hoverBg: `rgb(var(--mui-mainColorChannels-dark) / 0.08)`,
          disabledBg: `rgb(var(--mui-mainColorChannels-dark) / 0.06)`
        },
        LinearProgress: {
          primaryBg: 'var(--mui-palette-primary-mainOpacity)',
          secondaryBg: 'var(--mui-palette-secondary-mainOpacity)',
          errorBg: 'var(--mui-palette-error-mainOpacity)',
          warningBg: 'var(--mui-palette-warning-mainOpacity)',
          infoBg: 'var(--mui-palette-info-mainOpacity)',
          successBg: 'var(--mui-palette-success-mainOpacity)'
        },
        SnackbarContent: {
          bg: '#F7F4FF',
          color: 'var(--mui-palette-background-paper)'
        },
        Switch: {
          defaultColor: 'var(--mui-palette-common-white)',
          defaultDisabledColor: 'var(--mui-palette-common-white)',
          primaryDisabledColor: 'var(--mui-palette-common-white)',
          secondaryDisabledColor: 'var(--mui-palette-common-white)',
          errorDisabledColor: 'var(--mui-palette-common-white)',
          warningDisabledColor: 'var(--mui-palette-common-white)',
          infoDisabledColor: 'var(--mui-palette-common-white)',
          successDisabledColor: 'var(--mui-palette-common-white)'
        },
        Tooltip: {
          bg: '#F7F4FF'
        },
        TableCell: {
          border: 'var(--mui-palette-divider)'
        },
        customColors: {
          bodyBg: '#28243D',
          chatBg: '#373452',
          greyLightBg: '#373350',
          inputBorder: `rgb(var(--mui-mainColorChannels-dark) / 0.22)`,
          tableHeaderBg: '#3D3759',
          tooltipText: '#312D4B',
          trackBg: '#474360'
        }
      }
    }
  }
}

export default colorSchemes
