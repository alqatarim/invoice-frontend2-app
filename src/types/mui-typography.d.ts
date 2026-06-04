import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    h7: React.CSSProperties;
    'body1.5': React.CSSProperties;
    'subtitle1.5': React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    h7?: React.CSSProperties;
    'body1.5'?: React.CSSProperties;
    'subtitle1.5'?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h7: true;
    'body1.5': true;
    'subtitle1.5': true;
  }
}
