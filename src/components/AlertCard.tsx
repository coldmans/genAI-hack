import React from 'react';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  dDay?: number;
  category: string;
  urgent: boolean;
}

interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  return (
    <button className={`alert-card ${alert.urgent ? 'urgent' : ''}`} onClick={onClick}>
      <div className={`alert-icon ${alert.urgent ? 'urgent' : ''}`}>
        {alert.urgent ? <AlertTriangle /> : <Clock />}
      </div>
      <div className="alert-content">
        <div className="alert-meta">
          <span className={`alert-category ${alert.urgent ? 'urgent' : ''}`}>
            {alert.category}
          </span>
          {alert.dDay !== undefined && (
            <span className={`alert-dday ${alert.urgent ? 'urgent' : ''}`}>
              D-{alert.dDay}
            </span>
          )}
        </div>
        <h3 className="alert-title">{alert.title}</h3>
      </div>
      <ChevronRight className="alert-arrow" />
    </button>
  );
}
