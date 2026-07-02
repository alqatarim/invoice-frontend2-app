'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { usePermission } from '@/Auth/usePermission';
import PageIconHeader from '@components/headers/PageIconHeader';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';

import AiReportsChatWrapper from './components/AiReportsChatWrapper';
import { useAiReportsChat } from './useAiReportsChat';

const AiReportsView = ({ initialSuggestions = [] }) => {
  const canView = usePermission('aiReport', 'view');
  const {
    storeBranches,
    hasStoreScope,
    isRestrictedToAssignedStores,
  } = useAccessibleStoreScope();

  const [branchId, setBranchId] = useState('');

  const {
    sessions,
    activeSessionId,
    messages,
    suggestions,
    isLoading,
    sendMessage,
    startNewChat,
    clearActiveChat,
    selectSession,
    deleteSession,
    refreshSuggestions,
  } = useAiReportsChat({ initialSuggestions });

  useEffect(() => {
    refreshSuggestions(branchId);
  }, [branchId, refreshSuggestions]);

  if (!canView) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='h6'>You do not have permission to view AI Reports.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageIconHeader
        title='AI Reports'
        icon='humbleicons:ai'
      />

      <AiReportsChatWrapper
        sessions={sessions}
        activeSessionId={activeSessionId}
        messages={messages}
        suggestions={suggestions}
        isLoading={isLoading}
        onSend={(prompt) => sendMessage(prompt, { branchId })}
        onNewChat={startNewChat}
        onClearChat={clearActiveChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        branchId={branchId}
        onBranchChange={setBranchId}
        storeBranches={storeBranches}
        hasStoreScope={hasStoreScope}
        isRestrictedToAssignedStores={isRestrictedToAssignedStores}
      />
    </Box>
  );
};

export default AiReportsView;
