import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './KpiCard.css';


export default function KpiCard({ value, label, icon, iconBg, change, changeLabel, delay = 0 }) {
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    return (
        <div className="kpi-card" style={{ animationDelay: `${delay}ms` }}>
            <div className="kpi-card-top">
                <div className="kpi-card-icon" style={{ background: iconBg }}>
                    {icon}
                </div>
                {change !== undefined && (
                    <div className={`kpi-badge ${trend}`}>
                        <TrendIcon size={10} />
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div>
                <div className="kpi-card-value">{value}</div>
                <div className="kpi-card-label">{label}</div>
                {changeLabel && (
                    <div style={{ fontSize: '11px', color: 'var(--c-text-faint)', marginTop: '4px' }}>
                        {changeLabel}
                    </div>
                )}
            </div>
        </div>
    );
}
