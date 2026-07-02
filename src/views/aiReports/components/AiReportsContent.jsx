'use client';

import { useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import OptionMenu from '@core/components/option-menu';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';

import AvatarWithBadge from './AvatarWithBadge';
import ChatThread from './ChatThread';
import ChatInput from './ChatInput';
import { Icon } from '@iconify/react';
const CHAT_BG = 'var(--mui-palette-customColors-chatBg)';

const AiReportsContent = ({
  messages = [],
  suggestions = [],
  isLoading = false,
  onSend,
  onClearChat,
  onDeleteSession,
  onSelectPrompt,
  branchId,
  onBranchChange,
  storeBranches = [],
  hasStoreScope = false,
  isRestrictedToAssignedStores = false,
  isBelowMdScreen = false,
  setSidebarOpen,
  setBackdropOpen,
  inputRef,
}) => {
  const localInputRef = useRef(null);
  const resolvedInputRef = inputRef || localInputRef;



  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        height: '100%',
        bgcolor: CHAT_BG,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2, sm: 2.5 },
          py: 2.125,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: CHAT_BG,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          {isBelowMdScreen ? (
            <IconButton
              size='small'
              onClick={() => {
                setSidebarOpen(true);
                setBackdropOpen(true);
              }}
            >
              <i className='ri-menu-line text-textSecondary' />
            </IconButton>
          ) : null}
          <AvatarWithBadge
            // alt='Business Analyst'
            color='primary'
            badgeColor='success'
            size={40}
            icon='mdi:robot-outline'
          />
          <Typography color='text.primary' sx={{ fontWeight: 500, lineHeight: 1.3 }}>
            AI Agent
          </Typography>

        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {hasStoreScope ? (
            <Box sx={{ minWidth: 300, maxWidth: 400 }}>
              <StoreScopeSelect
                fullWidth
                size='small'
                label='Store scope'
                value={branchId}
                onChange={onBranchChange}
                branches={storeBranches}
                allLabel={
                  isRestrictedToAssignedStores ? 'All assigned stores' : 'All Stores'
                }
              />
            </Box>
          ) : null}
          {/* <IconButton size='small' aria-label='Search in conversation'>
            <i className='ri-search-line text-textSecondary' />
          </IconButton> */}

          <IconButton size='small' color='secondary' onClick={onClearChat} aria-label='Search in conversation'>
            <Icon icon='mdi:clear-circle-outline' width={24} />
          </IconButton>

          <IconButton size='small' color='error' onClick={onDeleteSession} aria-label='Delete conversation'>
            <Icon icon='mdi:delete-outline' width={24} />
          </IconButton>

        </Box>
      </Box>

      <ChatThread
        messages={messages}
        isLoading={isLoading}
        suggestions={suggestions}
        onSelectPrompt={onSelectPrompt}
      />

      <ChatInput onSend={onSend} disabled={isLoading} inputRef={resolvedInputRef} />
    </Box>
  );
};

export default AiReportsContent;
