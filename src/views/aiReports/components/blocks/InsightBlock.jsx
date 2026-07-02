'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';

const ICONS = {
  success: 'ri-checkbox-circle-line',
  warning: 'ri-error-warning-line',
  error: 'ri-close-circle-line',
  info: 'ri-information-line',
};

const InsightBlock = ({ variant = 'info', title = '', text = '' }) => {
  if (!text && !title) return null;

  const iconClass = ICONS[variant] || ICONS.info;

  return (
    <Alert
      severity={variant}
      variant='outlined'
      icon={<Box component='i' className={iconClass} sx={{ fontSize: 22 }} />}
      sx={{
        alignItems: 'flex-start',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      {title ? <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle> : null}
      {text}
    </Alert>
  );
};

export default InsightBlock;
