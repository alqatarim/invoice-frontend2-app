'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';

import CustomAvatar from '@core/components/mui/Avatar';
import { formatChatDate } from '../utils/formatChatDate';
import { groupChatMessages } from '../utils/groupChatMessages';
import ReportCanvas from './ReportCanvas';
import SuggestedPrompts from './SuggestedPrompts';
import { Icon } from '@iconify/react';
const CHAT_BG = 'var(--mui-palette-customColors-chatBg)';

const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef }) => {
  if (isBelowLgScreen) {
    return (
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          bgcolor: CHAT_BG,
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <PerfectScrollbar
      ref={scrollRef}
      options={{ wheelPropagation: false }}
      style={{ flex: 1, minHeight: 0, background: CHAT_BG }}
    >
      {children}
    </PerfectScrollbar>
  );
};

const getMaxWidth = ({ isBelowMdScreen, isBelowSmScreen, isUser }) => {
  if (isBelowSmScreen) return 'calc(100% - 5.75rem)';
  if (isBelowMdScreen) return isUser ? '75%' : '90%';
  return isUser ? '65%' : '78%';
};

const UserMessageGroup = ({ messages = [], isBelowMdScreen, isBelowSmScreen }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      flexDirection: 'row-reverse',
      px: { xs: 2, sm: 2.5, md: 3 },
      py: 2,
    }}
  >
    <CustomAvatar skin='filled' color='primary' size={32}>
      <i className='ri-user-3-line text-base' />
    </CustomAvatar>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
        maxWidth: getMaxWidth({ isBelowMdScreen, isBelowSmScreen, isUser: true }),
      }}
    >
      {messages.map((message) => (
        <Typography
          key={message.id}
          sx={{
            px: 2,
            py: 1,
            borderRadius: '12px 0 12px 12px',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: 'var(--mui-customShadows-xs)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            width: 'fit-content',
            maxWidth: '100%',
          }}
        >
          {message.content}
        </Typography>
      ))}
      {messages.length ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <i className='ri-check-double-line text-success text-base' />
          <Typography variant='caption' color='text.secondary'>
            {formatChatDate(messages[messages.length - 1].createdAt)}
          </Typography>
        </Box>
      ) : null}
    </Box>
  </Box>
);

const AssistantMessageGroup = ({ messages = [], isBelowMdScreen, isBelowSmScreen }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      px: { xs: 2, sm: 2.5, md: 3 },
      py: 2,
    }}
  >
    <CustomAvatar skin='light' color='primary' size={32}>
      <i className='ri-robot-2-line text-base' />
    </CustomAvatar>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: getMaxWidth({ isBelowMdScreen, isBelowSmScreen, isUser: false }),
        minWidth: 0,
        width: '100%',
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: '0 12px 12px 12px',
            bgcolor: 'background.paper',
            boxShadow: 'var(--mui-customShadows-xs)',
            width: '100%',
          }}
        >
          <ReportCanvas blocks={message.blocks || []} />
        </Box>
      ))}
      {messages.length ? (
        <Typography variant='caption' color='text.secondary'>
          {formatChatDate(messages[messages.length - 1].createdAt)}
        </Typography>
      ) : null}
    </Box>
  </Box>
);

const LoadingBubble = () => (
  <Box sx={{ display: 'flex', gap: 2, px: { xs: 2, sm: 2.5, md: 3 }, py: 2 }}>
    <CustomAvatar skin='light' color='primary' size={32}>
      <Icon icon='mdi:robot-outline' />
    </CustomAvatar>
    <Box
      sx={{
        flex: 1,
        maxWidth: 640,
        px: 2,
        py: 1.5,
        borderRadius: '0 12px 12px 12px',
        bgcolor: 'background.paper',
        boxShadow: 'var(--mui-customShadows-xs)',
      }}
    >
      <Stack spacing={1.5}>
        <Skeleton width='55%' />
        <Stack direction='row' spacing={1}>
          <Skeleton variant='rounded' height={72} sx={{ flex: 1 }} />
          <Skeleton variant='rounded' height={72} sx={{ flex: 1 }} />
          <Skeleton variant='rounded' height={72} sx={{ flex: 1 }} />
        </Stack>
        <Skeleton variant='rounded' height={180} />
      </Stack>
    </Box>
  </Box>
);

const EmptyState = ({ onSelectPrompt, suggestions = [], disabled }) => (
  <Box
    sx={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2.25,
      px: 3,
      py: 6,
      textAlign: 'center',
    }}
  >
    <CustomAvatar skin='light' color='primary' size={98}>
      <i className='ri-wechat-line' style={{ fontSize: 50 }} />
    </CustomAvatar>
    <Typography sx={{ maxWidth: 360 }}>
      Ask a question to generate charts, tables, and insights from your business data.
    </Typography>
    <Box sx={{ width: '100%', maxWidth: 720, mt: 0.5 }}>
      <SuggestedPrompts
        suggestions={suggestions.slice(0, 4)}
        onSelect={onSelectPrompt}
        disabled={disabled}
        variant='empty'
      />
    </Box>
  </Box>
);

const ChatThread = ({
  messages = [],
  isLoading = false,
  suggestions = [],
  onSelectPrompt = () => { },
}) => {
  const theme = useTheme();
  const isBelowLgScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isBelowMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isBelowSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollRef = useRef(null);
  const messageGroups = groupChatMessages(messages);

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    if (isBelowLgScreen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      return;
    }
    const container = scrollRef.current._container;
    if (container) container.scrollTop = container.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isLoading]);

  const showInlineSuggestions = messages.length > 0 && !isLoading && suggestions.length > 0;

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef}>
      <CardContent sx={{ p: 0, minHeight: '100%' }}>
        {!messages.length && !isLoading ? (
          <EmptyState
            suggestions={suggestions}
            onSelectPrompt={onSelectPrompt}
            disabled={isLoading}
          />
        ) : (
          <>
            {messageGroups.map((group, index) =>
              group.role === 'user' ? (
                <UserMessageGroup
                  key={`user-group-${index}`}
                  messages={group.messages}
                  isBelowMdScreen={isBelowMdScreen}
                  isBelowSmScreen={isBelowSmScreen}
                />
              ) : (
                <AssistantMessageGroup
                  key={`assistant-group-${index}`}
                  messages={group.messages}
                  isBelowMdScreen={isBelowMdScreen}
                  isBelowSmScreen={isBelowSmScreen}
                />
              )
            )}
            {isLoading ? <LoadingBubble /> : null}
            {showInlineSuggestions ? (
              <Box sx={{ px: { xs: 2, sm: 2.5, md: 3 }, pb: 3, pt: 0.5 }}>
                <SuggestedPrompts
                  suggestions={suggestions}
                  onSelect={onSelectPrompt}
                  disabled={isLoading}
                  variant='inline'
                />
              </Box>
            ) : null}
          </>
        )}
      </CardContent>
    </ScrollWrapper>
  );
};

export default ChatThread;
