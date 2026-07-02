'use client';

import { useEffect, useRef, useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import AiReportsSidebar from './AiReportsSidebar';
import AiReportsContent from './AiReportsContent';

const AiReportsChatWrapper = ({
  sessions = [],
  activeSessionId,
  messages = [],
  suggestions = [],
  isLoading = false,
  onSend,
  onNewChat,
  onClearChat,
  onDeleteSession,
  onSelectSession,
  branchId,
  onBranchChange,
  storeBranches = [],
  hasStoreScope = false,
  isRestrictedToAssignedStores = false,
}) => {
  const theme = useTheme();
  const isBelowMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isBelowSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false);
    }
  }, [isBelowMdScreen, backdropOpen, sidebarOpen]);

  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true);
    }
  }, [isBelowSmScreen, sidebarOpen]);

  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [backdropOpen, sidebarOpen]);

  useEffect(() => {
    if (activeSessionId && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [activeSessionId]);

  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    if (isBelowMdScreen) {
      setSidebarOpen(false);
      if (backdropOpen) setBackdropOpen(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        boxShadow: 'var(--mui-customShadows-md)',
        height: { xs: 'calc(100dvh - 200px)', md: 'calc(100dvh - 176px)' },
        minHeight: 520,
      }}
    >
      <AiReportsSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onDeleteSession={onDeleteSession}
        onNewChat={onNewChat}
        sidebarOpen={!isBelowMdScreen ? true : sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setBackdropOpen={setBackdropOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
      />

      <AiReportsContent
        messages={messages}
        suggestions={suggestions}
        isLoading={isLoading}
        onSend={onSend}
        onClearChat={onClearChat}
        onDeleteSession={() => onDeleteSession(activeSessionId)}
        onSelectPrompt={(prompt) => onSend(prompt)}
        branchId={branchId}
        onBranchChange={onBranchChange}
        storeBranches={storeBranches}
        hasStoreScope={hasStoreScope}
        isRestrictedToAssignedStores={isRestrictedToAssignedStores}
        isBelowMdScreen={isBelowMdScreen}
        setSidebarOpen={setSidebarOpen}
        setBackdropOpen={setBackdropOpen}
        inputRef={messageInputRef}
      />

      <Backdrop
        open={backdropOpen}
        onClick={() => setBackdropOpen(false)}
        sx={{ position: 'absolute', zIndex: 10 }}
      />
    </Box>
  );
};

export default AiReportsChatWrapper;
