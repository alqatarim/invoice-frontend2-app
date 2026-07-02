'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { usePermission } from '@/Auth/usePermission';
import { usePermissions } from '@/Auth/PermissionsContext';
import { extendWarranty, voidWarranty } from '@/app/(dashboard)/warranties/actions';
import { warrantyTerminalStatuses } from '@/data/dataSets';

export const getSourceDisplay = warranty => {
  const sourceType = warranty?.sourceDocumentType || warranty?.source || 'manual';
  if (sourceType === 'replacement') return 'Replacement';
  if (sourceType === 'invoice' || sourceType === 'receipt') return warranty?.sourceDocumentId?.invoiceNumber || 'N/A';
  return 'Manual';
};

export default function useEditWarrantyHandler({ warranty, initialErrorMessage = '' }) {
  const router = useRouter();
  const permissions = usePermissions();
  const isPermissionsReady = Boolean(permissions?.isReady);
  const canUpdateWarranty = usePermission('warranty', 'update');
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [voidOpen, setVoidOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [extension, setExtension] = useState({ value: 1, unit: 'months', reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  useEffect(() => {
    if (!isPermissionsReady || canUpdateWarranty) return;
    router.replace('/warranties/warranty-list');
  }, [canUpdateWarranty, isPermissionsReady, router]);

  const status = warranty?.effectiveStatus || warranty?.status || 'active';
  const actionDisabled = warrantyTerminalStatuses.includes(status);
  const canExtend = !actionDisabled && warranty?.policySnapshot?.extensionAllowed !== false;
  const claims = warranty?.claims || [];
  const events = warranty?.events || [];
  const extensions = warranty?.extensions || [];

  const openVoidDialog = useCallback(() => {
    setVoidOpen(true);
  }, []);

  const closeVoidDialog = useCallback(() => {
    setVoidOpen(false);
  }, []);

  const openExtendDialog = useCallback(() => {
    setExtendOpen(true);
  }, []);

  const closeExtendDialog = useCallback(() => {
    setExtendOpen(false);
  }, []);

  const updateExtensionField = useCallback(field => event => {
    setExtension(current => ({ ...current, [field]: event.target.value }));
  }, []);

  const handleVoid = useCallback(async () => {
    if (!voidReason.trim()) {
      enqueueSnackbar('Void reason is required', { variant: 'error' });
      return;
    }

    setSaving(true);
    const result = await voidWarranty(warranty._id, { reason: voidReason });
    setSaving(false);

    if (!result.success) {
      enqueueSnackbar(result.message || 'Failed to void warranty', { variant: 'error' });
      return;
    }

    enqueueSnackbar(result.message || 'Warranty voided', { variant: 'success' });
    setVoidOpen(false);
    router.refresh();
  }, [enqueueSnackbar, router, voidReason, warranty?._id]);

  const handleExtend = useCallback(async () => {
    if (!extension.reason.trim()) {
      enqueueSnackbar('Extension reason is required', { variant: 'error' });
      return;
    }

    setSaving(true);
    const result = await extendWarranty(warranty._id, {
      duration: { value: Number(extension.value || 0), unit: extension.unit },
      reason: extension.reason,
      source: 'manual',
    });
    setSaving(false);

    if (!result.success) {
      enqueueSnackbar(result.message || 'Failed to extend warranty', { variant: 'error' });
      return;
    }

    enqueueSnackbar(result.message || 'Warranty extended', { variant: 'success' });
    setExtendOpen(false);
    router.refresh();
  }, [enqueueSnackbar, extension, router, warranty?._id]);

  return {
    actionDisabled,
    activeTab,
    canExtend,
    canUpdateWarranty,
    claims,
    closeExtendDialog,
    closeVoidDialog,
    events,
    extendOpen,
    extension,
    extensions,
    handleExtend,
    handleVoid,
    isPermissionsReady,
    openExtendDialog,
    openVoidDialog,
    saving,
    setActiveTab,
    setVoidReason,
    status,
    updateExtensionField,
    voidOpen,
    voidReason,
  };
}
