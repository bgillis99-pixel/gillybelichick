import React from 'react';
import { PlaceResult } from '../types';

interface Props {
  place: PlaceResult;
}

const PlaceCard: React.FC<Props> = ({ place }) => {
  return (
    <div className="bg-white rounded-xl border border-purple-200/50 shadow-sm overflow-hidden animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-purple-400 to-indigo-500" />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-sam-text">{place.name}</p>
            <p className="text-xs text-sam-muted mt-0.5 truncate">{place.address}</p>
            <div className="flex items-center gap-3 mt-1">
              {place.rating && (
                <span className="text-xs text-sam-amber font-medium">
                  {'★'.repeat(Math.round(place.rating))} {place.rating}
                </span>
              )}
              {place.distance && (
                <span className="text-xs text-sam-muted">{place.distance}</span>
              )}
            </div>
            {place.mapUrl && (
              <a
                href={place.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-purple-600 hover:text-purple-700"
              >
                View on map
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

export default PlaceCard;
