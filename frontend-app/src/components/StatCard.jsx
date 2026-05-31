const StatCard = ({ title, value, color, icon }) => {
    return (
        <>
            <div className="stat-card" style={{ borderLeftColor: color }}>
                <div
                    className="stat-card__icon"
                    style={{ background: `${color}15` }}
                    aria-hidden="true"
                >
                    {icon}
                </div>
                <div>
                    <div className="stat-card__title">{title}</div>
                    <div className="stat-card__value">{value}</div>
                </div>
            </div>
            <style>{`
                .stat-card {
                    align-items: center;
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-left: 4px solid transparent;
                    border-radius: 12px;
                    display: flex;
                    gap: 16px;
                    padding: 20px 24px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .stat-card:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                    transform: translateY(-2px);
                }

                .stat-card__icon {
                    align-items: center;
                    border-radius: 12px;
                    display: flex;
                    font-size: 24px;
                    height: 48px;
                    justify-content: center;
                    width: 48px;
                }

                .stat-card__title {
                    color: #64748b;
                    font-size: 11px;
                    letter-spacing: 0.6px;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }

                .stat-card__value {
                    color: #0f172a;
                    font-size: 28px;
                    font-weight: 700;
                }
            `}</style>
        </>
    );
};

export default StatCard;
