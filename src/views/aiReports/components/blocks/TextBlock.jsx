'use client';

import Typography from '@mui/material/Typography';

const TextBlock = ({ content = '' }) => (
  <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
    {content}
  </Typography>
);

export default TextBlock;
