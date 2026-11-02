'use client';

/**
 * VisualErrorFallback — shown when a VisualSpec fails Zod validation.
 * Never crashes the UI — always renders a friendly message.
 */
import { AlertTriangle } from 'lucide-react';

export default function VisualErrorFallback({ errors }) {
  return (
    <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-amber-800">Could not render this visual</p>
        <p className="text-xs text-amber-700 mt-0.5">
          The data format returned by the AI was unexpected. Please try asking again.
        </p>
        {process.env.NODE_ENV === 'development' && errors && (
          <pre className="mt-2 text-[10px] text-amber-800 bg-amber-100 rounded p-2 overflow-auto max-h-28">
            {JSON.stringify(errors, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

