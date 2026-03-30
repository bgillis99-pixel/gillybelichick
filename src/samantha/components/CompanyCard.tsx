import React from 'react';
import { CompanyInfo } from '../types';

interface Props {
  company: CompanyInfo;
}

const CompanyCard: React.FC<Props> = ({ company }) => {
  return (
    <div className="bg-white rounded-xl border border-blue-200/50 shadow-sm overflow-hidden animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-sam-text">{company.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {company.dotNumber && (
                <p className="text-xs text-sam-muted">DOT# {company.dotNumber}</p>
              )}
              {company.mcNumber && (
                <p className="text-xs text-sam-muted">MC# {company.mcNumber}</p>
              )}
              {company.vehicles && (
                <p className="text-xs text-sam-muted">{company.vehicles} vehicles</p>
              )}
            </div>
            {company.address && (
              <p className="text-xs text-sam-muted mt-0.5 truncate">📍 {company.address}</p>
            )}
            {company.safetyRating && (
              <p className="text-xs mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  company.safetyRating === 'Satisfactory' ? 'bg-green-100 text-green-700' :
                  company.safetyRating === 'Conditional' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {company.safetyRating}
                </span>
              </p>
            )}
            {company.phone && (
              <a href={`tel:${company.phone}`} className="text-xs text-sam-coral mt-1 inline-block">
                📞 {company.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
