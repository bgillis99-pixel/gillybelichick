import React from 'react';
import { DirectionsResult } from '../types';

interface Props {
  directions: DirectionsResult;
}

const DirectionsCard: React.FC<Props> = ({ directions }) => {
  return (
    <div className="bg-white rounded-xl border border-green-200/50 shadow-sm overflow-hidden animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-sam-text">{directions.distance}</span>
              <span className="text-xs text-sam-muted">&middot;</span>
              <span className="text-sm font-medium text-green-600">{directions.duration}</span>
            </div>
            <p className="text-xs text-sam-muted truncate">From: {directions.origin}</p>
            <p className="text-xs text-sam-muted truncate">To: {directions.destination}</p>
            {directions.steps && directions.steps.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {directions.steps.slice(0, 3).map((step, i) => (
                  <p key={i} className="text-xs text-sam-text/70 truncate">{i + 1}. {step}</p>
                ))}
              </div>
            )}
            {directions.mapUrl && (
              <a
                href={directions.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-600 hover:text-green-700"
              >
                Open in Maps
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectionsCard;
