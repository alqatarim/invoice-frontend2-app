'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AvatarWithBadge from './AvatarWithBadge';
import { formatChatDate, getSessionPreview } from '../utils/formatChatDate';

const SIDEBAR_WIDTH = 370;
const DELETE_ACTION_WIDTH = 80;

const SessionRow = ({
  session,
  isActive,
  isSwipeOpen,
  onSelect,
  onDelete,
  onSwipeOpen,
  onSwipeClose,
}) => {
  const preview = getSessionPreview(session);
  const title = session.title || 'New conversation';
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [committedOffset, setCommittedOffset] = useState(0);
  const dragStateRef = useRef(null);
  const dragOffsetRef = useRef(0);
  const dragOccurredRef = useRef(false);
  const wasSwipeOpenRef = useRef(isSwipeOpen);

  const isDeleteRevealed = isDragging || committedOffset < 0;

  const resolvedOffset = isDragging ? dragOffset : committedOffset;

  const resetDrag = () => {
    dragStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  useEffect(() => {
    if (isSwipeOpen) {
      setCommittedOffset(-DELETE_ACTION_WIDTH);
    } else if (wasSwipeOpenRef.current) {
      setCommittedOffset(0);
    }
    wasSwipeOpenRef.current = isSwipeOpen;
  }, [isSwipeOpen]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: isSwipeOpen ? -DELETE_ACTION_WIDTH : 0,
      direction: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.direction) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      dragState.direction = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
      if (dragState.direction === 'y') {
        event.currentTarget.releasePointerCapture(event.pointerId);
        resetDrag();
        return;
      }
      setIsDragging(true);
      dragOccurredRef.current = true;
    }

    if (dragState.direction !== 'x') return;

    const nextOffset = Math.min(0, Math.max(-DELETE_ACTION_WIDTH, dragState.startOffset + deltaX));
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const handlePointerEnd = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragState.direction === 'x') {
      const shouldOpen = dragOffsetRef.current < -DELETE_ACTION_WIDTH / 2;
      const nextCommittedOffset = shouldOpen ? -DELETE_ACTION_WIDTH : 0;
      setCommittedOffset(nextCommittedOffset);
      if (shouldOpen) {
        onSwipeOpen();
      } else {
        onSwipeClose();
      }
    }

    resetDrag();
  };

  const handleClick = () => {
    if (dragOccurredRef.current) {
      dragOccurredRef.current = false;
      return;
    }

    if (committedOffset < 0) {
      setCommittedOffset(0);
      onSwipeClose();
      return;
    }

    onSelect(session.id);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    setCommittedOffset(0);
    onDelete(session.id);
    onSwipeClose();
  };

  return (
    <Box
      component='li'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
        mb: 0.5,
        listStyle: 'none',
      }}
    >
      <Box
        aria-hidden={!isDeleteRevealed}
        sx={{
          position: 'absolute',
          insetBlock: 0,
          insetInlineEnd: 0,
          width: DELETE_ACTION_WIDTH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'error.main',
          opacity: isDeleteRevealed ? 1 : 0,
          pointerEvents: isDeleteRevealed ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        <IconButton
          onClick={handleDelete}
          aria-label='Delete conversation'
          sx={{ color: 'error.contrastText' }}
        >
          <i className='ri-delete-bin-line text-xl' />
        </IconButton>
      </Box>

      <Box
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3,
          px: 3,
          py: 2,
          cursor: 'pointer',
          touchAction: 'pan-y',
          userSelect: isDragging ? 'none' : 'auto',
          transform: `translateX(${resolvedOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease',
          ...(isActive
            ? {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: 'var(--mui-customShadows-xs)',
            }
            : {
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'grey.50' },
            }),
        }}
      >
        <AvatarWithBadge
          alt={title}
          color='primary'
          badgeColor='success'
          isChatActive={isActive}
          size={37.5}
          icon='mdi:robot-outline'
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 500,
              fontSize: '0.9375rem',
              color: 'inherit',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: isActive ? 'inherit' : 'text.secondary',
              opacity: isActive ? 0.9 : 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {preview}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <Typography
            variant='body2'
            sx={{
              fontSize: '0.8125rem',
              color: isActive ? 'inherit' : 'text.disabled',
            }}
          >
            {formatChatDate(session.updatedAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const CHAT_LIST_SCROLL_SX = {
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    width: 0,
    height: 0,
  },
  '&:hover': {
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--mui-palette-divider)',
      borderRadius: 999,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'var(--mui-palette-action-disabled)',
    },
  },
};

const ScrollWrapper = ({ children }) => (
  <Box sx={CHAT_LIST_SCROLL_SX}>{children}</Box>
);

const AiReportsSidebar = ({
  sessions = [],
  activeSessionId,
  onSelect,
  onDeleteSession,
  onNewChat,
  sidebarOpen,
  setSidebarOpen,
  setBackdropOpen,
  isBelowMdScreen,
  isBelowSmScreen,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [openSwipeId, setOpenSwipeId] = useState(null);

  const filteredSessions = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter((session) => {
      const title = String(session.title || '').toLowerCase();
      const preview = getSessionPreview(session).toLowerCase();
      return title.includes(query) || preview.includes(query);
    });
  }, [searchValue, sessions]);

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 4,
          py: 4,
          // borderBottom: 1,
          // borderColor: 'divider',
        }}
      >
        {/* <AvatarWithBadge
          alt='AI Reports'
          color='primary'
          badgeColor='success'
          onClick={onNewChat}
          size={40}
          icon={<i className='ri-robot-2-line text-lg' />}
        /> */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 1 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='Search conversations'
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    {searchValue.trim() ? (
                      <IconButton
                        size='small'
                        edge='start'
                        aria-label='Clear search'
                        onClick={() => setSearchValue('')}
                        sx={{ p: 0.25 }}
                      >
                        <i className='ri-close-line text-xl' />
                      </IconButton>
                    ) : (
                      <i className='ri-search-line text-xl' />
                    )}
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '999px !important',
              },
            }}
          />
          {isBelowMdScreen ? (
            <IconButton
              size='small'
              onClick={() => {
                setSidebarOpen(false);
                setBackdropOpen(false);
              }}
            >
              <i className='ri-close-line' />
            </IconButton>
          ) : (
            <IconButton size='small' onClick={onNewChat} color='primary'>
              <i className='ri-add-line' />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ScrollWrapper>
          <Box component='ul' sx={{ m: 0, p: 3, pt: 2 }}>
            {filteredSessions.length ? (
              filteredSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  isSwipeOpen={openSwipeId === session.id}
                  onSelect={(sessionId) => {
                    setOpenSwipeId(null);
                    onSelect(sessionId);
                  }}
                  onDelete={onDeleteSession}
                  onSwipeOpen={() => setOpenSwipeId(session.id)}
                  onSwipeClose={() => setOpenSwipeId((current) => (current === session.id ? null : current))}
                />
              ))
            ) : (
              <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  No conversations found.
                </Typography>
              </Box>
            )}
          </Box>
        </ScrollWrapper>
      </Box>
    </>
  );

  return (
    <Drawer
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
      ModalProps={{
        disablePortal: true,
        keepMounted: true,
      }}
      sx={{
        width: isBelowMdScreen ? 0 : SIDEBAR_WIDTH,
        flexShrink: 0,
        zIndex: isBelowMdScreen && sidebarOpen ? 11 : 10,
        position: isBelowMdScreen ? 'absolute' : 'relative',
        ...(isBelowSmScreen && sidebarOpen && { width: '100%' }),
        '& .MuiDrawer-paper': {
          overflow: 'hidden',
          boxShadow: 'none',
          width: isBelowSmScreen ? '100%' : SIDEBAR_WIDTH,
          position: isBelowMdScreen ? 'absolute' : 'static',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AiReportsSidebar;
