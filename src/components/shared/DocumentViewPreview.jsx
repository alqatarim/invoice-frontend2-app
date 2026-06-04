'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Image from 'next/image';
import { formatCurrency } from '@/utils/currencyUtils';

export const toDocumentNumber = value => (value ? `#${value}` : 'N/A');

export const toDocumentAmount = value => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'object') return 0;

  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

export const compactDocumentLines = lines => (Array.isArray(lines) ? lines.filter(Boolean) : []);

const renderValue = value => {
  if (React.isValidElement(value)) return value;
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

const SummaryRow = ({ label, value, strong = false }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
    <Typography
      className={strong ? 'text-[14px]' : 'text-[14px]'}
      fontWeight={strong ? 550 : 400}
      color={strong ? 'text.primary' : 'text.secondary'}
    >
      {label}
    </Typography>
    <Box sx={{ textAlign: 'right' }}>
      {React.isValidElement(value) ? value : formatCurrency(toDocumentAmount(value))}
    </Box>
  </Box>
);

const LinesBlock = ({ lines }) => {
  const safeLines = compactDocumentLines(lines);

  if (!safeLines.length) {
    return (
      <Typography className="text-[14px]" color="text.secondary">
        N/A
      </Typography>
    );
  }

  return safeLines.map((line, index) => (
    <Typography key={`${line}-${index}`} className="text-[14px]">
      {line}
    </Typography>
  ));
};

const DetailRows = ({ rows = [] }) => {
  const safeRows = rows.filter(row => row && (row.label || row.value));

  if (!safeRows.length) {
    return (
      <Typography className="text-[14px]" color="text.secondary">
        N/A
      </Typography>
    );
  }

  return (
    <Grid container className="flex flex-row justify-center gap-2 sm:gap-3" sx={{ width: '100%' }}>
      <Grid size={{ xs: 5, sm: 5 }} sx={{ textAlign: 'right' }} className="flex flex-col gap-0.5 min-w-0">
        {safeRows.map(row => (
          <Typography key={row.label} variant="body2" sx={{ wordBreak: 'break-word' }}>
            {row.label}
          </Typography>
        ))}
      </Grid>

      <Grid size={{ xs: 7, sm: 'auto' }} sx={{ textAlign: 'left' }} className="flex flex-col gap-0.5 min-w-0">
        {safeRows.map(row => (
          <Typography key={row.label} className="text-[14px]" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
            {renderValue(row.value)}
          </Typography>
        ))}
      </Grid>
    </Grid>
  );
};

const DocumentLogo = ({ logoSrc }) => {
  const logoSize = { xs: 56, sm: 64, md: 80 };

  if (!logoSrc || String(logoSrc).startsWith('/')) {
    return (
      <Box sx={{ width: logoSize, height: logoSize, position: 'relative', flexShrink: 0 }}>
        <Image
          src={logoSrc || '/images/illustrations/objects/store-2.png'}
          alt="Company Logo"
          fill
          sizes="(max-width:600px) 56px, 80px"
          style={{ objectFit: 'contain' }}
          priority
        />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={logoSrc}
      alt="Company Logo"
      sx={{ width: logoSize, height: logoSize, objectFit: 'contain', flexShrink: 0 }}
    />
  );
};

const DocumentViewPreview = ({
  actionBar = null,
  contentRef,
  previewId,
  pageClassName = 'document-view-page',
  loading = false,
  logoSrc = '/images/illustrations/objects/store-2.png',
  logoCaption = 'Store details',
  documentTitle,
  documentNumber,
  metaRows = [],
  leftSectionTitle,
  leftLines = [],
  rightSectionTitle,
  rightRows = [],
  rightLines = [],
  itemColumns = [],
  itemRows = [],
  emptyItemsMessage = 'No items found.',
  terms,
  notes,
  summaryRows = [],
  totalRow = null,
  footerSummaryRows = [],
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  const visibleMetaRows = metaRows.filter(row => row && (row.label || row.value));

  return (
    <Box
      className="flex flex-col gap-4 sm:gap-6"
      sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}
    >
      {actionBar ? <Box className="print:hidden">{actionBar}</Box> : null}

      <Box
        ref={contentRef}
        id={previewId}
        sx={{ width: '100%', maxWidth: '100%', minWidth: 0, mx: 'auto' }}
      >
        <Card
          className={`previewCard ${pageClassName}`}
          sx={{
            width: { xs: '100%', md: '210mm' },
            maxWidth: '100%',
            minHeight: { xs: 'auto', md: '297mm' },
            display: 'flex',
            flexDirection: 'column',
            mx: { xs: 0, md: 'auto' },
            boxShadow: { xs: 1, md: 2 },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              margin: { xs: 1, sm: 1.5, md: '30px' },
              padding: 0,
              border: theme => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `,
              borderRadius: 1,
              minHeight: { xs: 'auto', md: 'calc(297mm - 70px)' },
              flex: 1,
            }}
          >
            <Grid
              container
              sx={{
                alignItems: 'start',
                display: 'flex',
                flexDirection: 'column',
                '& > *': { width: '100%' },
              }}
            >
              <Grid
                item
                sx={{
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: theme => alpha(theme.palette.secondary.main, 0.075),
                }}
              >
                <Grid
                  container
                  className="flex-row justify-between items-start"
                  spacing={{ xs: 2, sm: 4, md: 8 }}
                  sx={{ p: { xs: 2, sm: 3, md: 4 } }}
                >
                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <Grid container className="flex flex-start" spacing={1}>
                      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <DocumentLogo logoSrc={logoSrc} />
                      </Grid>
                      {/* <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                          {logoCaption}
                        </Typography>
                      </Grid> */}
                    </Grid>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <Grid
                      container
                      spacing={{ xs: 1.5, sm: 2, md: 3 }}
                      className="flex flex-row justify-start sm:justify-end"
                      sx={{ width: '100%' }}
                    >
                      <Grid size={{ xs: 'auto' }} className="text-left">
                        <Typography variant="body2" color="text.secondary"
                          fontWeight={450}
                          fontSize='15px'>
                          {documentTitle}
                        </Typography>
                        {visibleMetaRows.map(row => (
                          <Typography
                            key={row.label}
                            variant="body2"
                            color="text.secondary"
                            fontWeight={450}
                            fontSize='15px'
                          >
                            {row.label}
                          </Typography>
                        ))}
                      </Grid>

                      <Grid size={{ xs: 'auto' }} sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" color="text.primary"
                          fontWeight={450}
                          fontSize='15px'>
                          {toDocumentNumber(documentNumber)}
                        </Typography>
                        {visibleMetaRows.map(row => (
                          <Typography
                            key={row.label}
                            variant="body2"
                            color="text.primary"
                            fontWeight={450}
                            fontSize='15px'
                          >
                            {renderValue(row.value)}
                          </Typography>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Grid
                  container
                  borderBottom={theme => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `}
                  sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 2, sm: 3, md: 4 },
                    mb: { xs: 2, md: 4 },
                  }}
                  spacing={{ xs: 3, md: 4 }}
                  className="flex justify-between"
                >
                  <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" color="text.primary" fontWeight={600} gutterBottom>
                      {leftSectionTitle}
                    </Typography>
                    <LinesBlock lines={leftLines} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'left' }}>
                    <Grid container>
                      <Grid size={{ xs: 'auto' }} sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle1" color="text.primary" fontWeight={600} gutterBottom>
                          {rightSectionTitle}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        {rightRows.length ? <DetailRows rows={rightRows} /> : <LinesBlock lines={rightLines} />}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ px: { xs: 1.5, sm: 2, md: 5 }, py: { xs: 1, md: 0 } }}>
                <Box
                  borderColor={theme => alpha(theme.palette.secondary.main, 0.15)}
                  className="overflow-x-auto border rounded"
                  sx={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <Table
                    size="small"
                    sx={{
                      minWidth: { xs: 520, md: 'auto' },
                      '& .MuiTableCell-root': {
                        borderColor: theme => alpha(theme.palette.secondary.main, 0.15),
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        px: { xs: 1, sm: 1.5, md: 2 },
                        whiteSpace: { xs: 'nowrap', md: 'normal' },
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        {itemColumns.map(column => (
                          <TableCell
                            key={column.key || column.label}
                            align={column.align || 'left'}
                            className="!bg-transparent"
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemRows.length ? (
                        itemRows.map(row => (
                          <TableRow key={row.key}>
                            {row.cells.map((cell, index) => (
                              <TableCell
                                key={`${row.key}-${itemColumns[index]?.key || index}`}
                                align={itemColumns[index]?.align || 'left'}
                              >
                                {renderValue(cell)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={itemColumns.length || 1} align="center">
                            <Typography variant="body2" color="text.secondary" className="py-4">
                              {emptyItemsMessage}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ px: { xs: 1.5, sm: 2, md: 5 }, pb: { xs: 2, md: 5 }, pt: { xs: 5, md: 5 } }}>
                <Grid container spacing={{ xs: 3, md: 4 }} className="justify-between">
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Terms & Conditions:
                    </Typography>
                    <Typography variant="body2" color='text.primary' sx={{ mb: 2, wordBreak: 'break-word' }}>
                      {terms || 'N/A'}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes:
                    </Typography>
                    <Typography variant="body2" color='text.primary' sx={{ wordBreak: 'break-word' }}>
                      {notes || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        width: '100%',
                        minWidth: { xs: '100%', md: 240 },
                        maxWidth: { xs: '100%', md: 320 },
                        ml: { xs: 0, md: 'auto' },
                      }}
                    >
                      {summaryRows.map(row => (
                        <SummaryRow key={row.label} label={row.label} value={row.value} strong={row.strong} />
                      ))}
                      {totalRow ? (
                        <>
                          <Divider sx={{ my: 0.5 }} />
                          <SummaryRow label={totalRow.label} value={totalRow.value} strong />
                        </>
                      ) : null}
                      {footerSummaryRows.map(row => (
                        <SummaryRow key={row.label} label={row.label} value={row.value} strong={row.strong} />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DocumentViewPreview;
