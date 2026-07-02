'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import { askAiReport, getAiReportSuggestions } from '@/app/(dashboard)/ai-reports/actions';
import { FALLBACK_SUGGESTIONS } from './constants/suggestedPrompts';
import { buildReportContextForApi } from './utils/buildReportContextForApi';
import { formatAssistantMessageForApi } from './utils/formatAssistantMessageForApi';

const SESSIONS_STORAGE_KEY = 'ai-reports-sessions-v1';
const MAX_SESSIONS = 30;

const createMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildSessionTitle = (content = '') => {
  const trimmed = String(content || '').trim();
  if (!trimmed) return 'New conversation';
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
};

const createEmptySession = () => ({
  id: createSessionId(),
  title: 'New conversation',
  messages: [],
  updatedAt: new Date().toISOString(),
});

const readStoredSessions = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.sessions)) return null;
    return {
      sessions: parsed.sessions,
      activeSessionId: parsed.activeSessionId || parsed.sessions[0]?.id || null,
    };
  } catch {
    return null;
  }
};

const persistSessions = (sessions, activeSessionId) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      SESSIONS_STORAGE_KEY,
      JSON.stringify({ sessions, activeSessionId })
    );
  } catch {
    // Ignore quota errors.
  }
};

const getInitialChatState = () => {
  const stored = readStoredSessions();
  if (stored?.sessions?.length) {
    return {
      sessions: stored.sessions,
      activeSessionId: stored.activeSessionId || stored.sessions[0]?.id || null,
    };
  }
  const session = createEmptySession();
  return { sessions: [session], activeSessionId: session.id };
};

export function useAiReportsChat({ initialSuggestions = [] } = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const [sessions, setSessions] = useState(() => getInitialChatState().sessions);
  const [activeSessionId, setActiveSessionId] = useState(
    () => getInitialChatState().activeSessionId
  );
  const [suggestions, setSuggestions] = useState(
    initialSuggestions.length ? initialSuggestions : FALLBACK_SUGGESTIONS
  );
  const [isLoading, setIsLoading] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || sessions[0],
    [activeSessionId, sessions]
  );

  const messages = activeSession?.messages || [];

  useEffect(() => {
    persistSessions(sessions, activeSessionId);
  }, [sessions, activeSessionId]);

  const updateActiveSession = useCallback((updater) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        const next = typeof updater === 'function' ? updater(session) : updater;
        return {
          ...session,
          ...next,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [activeSessionId]);

  const refreshSuggestions = useCallback(async (branchId = '') => {
    try {
      const response = await getAiReportSuggestions({ branchId });
      const next = Array.isArray(response?.suggestions) ? response.suggestions : [];
      if (next.length) setSuggestions(next);
    } catch {
      setSuggestions(FALLBACK_SUGGESTIONS);
    }
  }, []);

  const sendMessage = useCallback(
    async (content, { branchId = '' } = {}) => {
      const trimmed = String(content || '').trim();
      if (!trimmed || isLoading) return;

      const userMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      let nextMessages = [];
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;
          nextMessages = [...session.messages, userMessage];
          return {
            ...session,
            title:
              session.messages.length === 0 ? buildSessionTitle(trimmed) : session.title,
            messages: nextMessages,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      setIsLoading(true);

      try {
        const recentMessages = nextMessages.slice(-12).map((message) => {
          if (message.role === 'assistant') {
            return {
              role: 'assistant',
              content: formatAssistantMessageForApi(message),
            };
          }
          return { role: 'user', content: message.content };
        });

        const reportContext = buildReportContextForApi(nextMessages);

        const response = await askAiReport({
          messages: recentMessages,
          branchId,
          locale: 'en',
          reportContext,
        });

        if (!response?.success) {
          enqueueSnackbar(response?.message || 'AI Reports request failed.', {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });
        }

        const data = response?.data || {};
        const assistantMessage = {
          id: createMessageId(),
          role: 'assistant',
          blocks: Array.isArray(data.blocks) ? data.blocks : [],
          meta: data.meta || {},
          createdAt: new Date().toISOString(),
        };

        updateActiveSession((session) => ({
          messages: [...session.messages, assistantMessage],
        }));

        if (Array.isArray(data.suggestedFollowUps) && data.suggestedFollowUps.length) {
          setSuggestions(data.suggestedFollowUps);
        }
      } catch (error) {
        enqueueSnackbar(error?.message || 'AI Reports request failed.', {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        updateActiveSession((session) => ({
          messages: [
            ...session.messages,
            {
              id: createMessageId(),
              role: 'assistant',
              createdAt: new Date().toISOString(),
              blocks: [
                {
                  type: 'text',
                  content: 'Something went wrong while generating your report. Please try again.',
                },
              ],
            },
          ],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, enqueueSnackbar, isLoading, updateActiveSession]
  );

  const startNewChat = useCallback(() => {
    const nextSession = createEmptySession();
    setSessions((prev) => [nextSession, ...prev].slice(0, MAX_SESSIONS));
    setActiveSessionId(nextSession.id);
  }, []);

  const clearActiveChat = useCallback(() => {
    updateActiveSession({ messages: [], title: 'New conversation' });
  }, [updateActiveSession]);

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback(
    (sessionId) => {
      setSessions((prev) => {
        const filtered = prev.filter((session) => session.id !== sessionId);
        if (!filtered.length) {
          const fallback = createEmptySession();
          setActiveSessionId(fallback.id);
          return [fallback];
        }
        if (sessionId === activeSessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeSessionId]
  );

  return {
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
  };
}
