'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Lead } from '@/types';
import { useStore } from '@/store';
import { coerceFollowUpToIsoString, extractId } from '@/lib/lead-form-map';
import { mapLeadFromApi } from '@/lib/lead-api-map';

export type LeadFormBootstrapState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; lead: Lead | null };

function normalizeLeadFromApi(raw: Record<string, unknown>): Lead {
  const base = mapLeadFromApi(raw);
  return {
    ...base,
    influencerId: extractId(raw.influencerId),
    followUpDate: coerceFollowUpToIsoString(raw.followUpDate) as Lead['followUpDate'],
  };
}

/**
 * Loads reference data (users, influencers) and optionally the lead being edited.
 * Avoids downloading the full leads list — audit/add flows use by-mobile or :id instead.
 */
export function useLeadFormBootstrap(leadId: string | undefined): LeadFormBootstrapState {
  const [state, setState] = useState<LeadFormBootstrapState>({ status: 'loading' });
  const loadUsers = useStore((s) => s.loadUsers);
  const loadInfluencers = useStore((s) => s.loadInfluencers);
  const token = useStore((s) => s.token);

  const runGenerationRef = useRef(0);
  const key = leadId ?? '__create__';

  useEffect(() => {
    const gen = ++runGenerationRef.current;
    let cancelled = false;

    // Reset to loading on every new target so consumers don't flash stale `ready` data.
    // This is the canonical shape for "re-fetch when prop changes"; the one-extra render
    // is negligible here and avoids the render-phase-ref alternative (banned by lint).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });

    const run = async () => {
      try {
        // loadUsers() hits /admin/users (admin-only). For sales, that 403 + authFetch logs the
        // user out before loadInfluencers() runs — the form would never get dropdown data.
        const isAdmin = useStore.getState().role === 'ADMIN';
        await Promise.all(
          isAdmin ? [loadUsers(), loadInfluencers()] : [loadInfluencers()],
        );
        if (cancelled || gen !== runGenerationRef.current) return;

        if (!leadId) {
          setState({ status: 'ready', lead: null });
          return;
        }

        const res = await fetch(`${API_BASE_URL}/sales/leads/${leadId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (cancelled || gen !== runGenerationRef.current) return;

        if (!res.ok) {
          const message =
            res.status === 404
              ? 'Lead not found or you do not have access.'
              : 'Failed to load lead.';
          setState({ status: 'error', message });
          return;
        }

        const raw = (await res.json()) as Record<string, unknown>;
        if (cancelled || gen !== runGenerationRef.current) return;
        setState({ status: 'ready', lead: normalizeLeadFromApi(raw) });
      } catch {
        if (!cancelled && gen === runGenerationRef.current) {
          setState({ status: 'error', message: 'Failed to load lead. Please try again.' });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [key, leadId, loadUsers, loadInfluencers, token]);

  return state;
}
