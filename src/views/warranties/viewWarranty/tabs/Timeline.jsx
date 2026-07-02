'use client';

import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import SectionHeader from '@/components/headers/SectionHeader';
import { Icon } from '@iconify/react';
const formatEventType = value => value?.replace(/_/g, ' ').toUpperCase() || 'EVENT';

const getEventTone = eventType => {
  const type = eventType || '';

  if (type.includes('claim')) {
    return {
      color: 'primary.main',
      lineColor: 'primary.light',
      icon: 'mdi:hand-extended-outline'
    };
  }

  if (type.includes('expired') || type.includes('void')) {
    return {
      color: 'error.main',
      lineColor: 'error.light',
      icon: 'ri-close-circle-line'
    };
  }

  return {
    color: 'success.main',
    lineColor: 'success.light',
    icon: 'ri-checkbox-circle-line'
  };
};

export default function Timeline({ events, extensions, formatDate, minHeight }) {
  return (
    <Card sx={{ minHeight: { xs: 'auto', md: minHeight } }}>
      <CardContent className='px-8 py-7'>
        <Stack spacing={4}>
          <SectionHeader title='Extensions & Events' icon="mdi:timeline-clock-outline" iconSize={30} />

          <Stack spacing={2}>
            {/* <Typography variant="h7">Extensions & Events</Typography> */}
            {/* {extensions.length ? extensions.map((item, index) => (
              <Typography key={`${item.createdAt}-${index}`} variant="body2">
                Extended to {formatDate(item.newEndDate)}: {item.reason}
              </Typography>
            )) : <Typography variant="body2">No extensions.</Typography>} */}
            {events.length ? (
              <Stack spacing={0}>
                {events.map((event, index) => (
                  <Box key={event._id} className="flex gap-5">
                    <Box className="flex flex-col items-center">
                      <Box
                        sx={{ color: getEventTone(event.eventType).color }}
                        className="relative z-[1] flex size-6 items-center justify-center rounded-full bg-backgroundPaper"
                      >
                        <Icon icon={getEventTone(event.eventType).icon} className="text-xl" />
                      </Box>
                      {index < events.length - 1 ? (
                        <Box
                          sx={{ borderColor: getEventTone(event.eventType).lineColor }}
                          className="min-h-14 flex-1 border-l border-dashed"
                        />
                      ) : null}
                    </Box>

                    <Stack spacing={0.5} className={`flex-1 ${index < events.length - 1 ? 'pb-5' : ''}`}>
                      <Typography
                        variant="body2"
                        sx={{ color: getEventTone(event.eventType).color, letterSpacing: 0.5 }}
                        className="font-semibold"
                      >
                        {formatEventType(event.eventType)}
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {event.message || 'No event details provided.'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.createdAt)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2">No timeline events.</Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
