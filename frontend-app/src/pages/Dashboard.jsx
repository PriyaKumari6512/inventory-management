import { useEffect, useState } from "react";

import { getCustomers, getOrders, getProducts } from "../api/index.js";
import StatCard from "../components/StatCard.jsx";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            setError("");
            try {
                const [productsResponse, customersResponse, ordersResponse] =
                    await Promise.all([getProducts(), getCustomers(), getOrders()]);

                if (!isMounted) {
                    return;
                }

                setProducts(productsResponse.data || []);
                setCustomers(customersResponse.data || []);
                setOrders(ordersResponse.data || []);
            } catch (fetchError) {
                if (!isMounted) {
                    return;
                }

                setError("Failed to load dashboard data.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const lowStockCount = products.filter((product) => product.quantity < 5).length;

    return (
        <div className="dashboard">
            <div className="dashboard__banner">
                <div className="dashboard__banner-title">
                    Welcome to Inventory Manager
                </div>
                <div className="dashboard__banner-subtitle">
                    Monitor your products, customers and orders in real time
                </div>
            </div>

            {loading ? (
                <div className="dashboard__state">Loading dashboard...</div>
            ) : error ? (
                <div className="dashboard__error">{error}</div>
            ) : (
                <div className="dashboard__grid">
                    <StatCard
                        title="Total Products"
                        value={products.length}
                        color="#2563eb"
                        icon="📦"
                    />
                    <StatCard
                        title="Total Customers"
                        value={customers.length}
                        color="#059669"
                        icon="👥"
                    />
                    <StatCard
                        title="Total Orders"
                        value={orders.length}
                        color="#7c3aed"
                        icon="🛒"
                    />
                    <StatCard
                        title="Low Stock"
                        value={lowStockCount}
                        color="#d97706"
                        icon="⚠️"
                    />
                </div>
            )}

            <style>{`
                .dashboard {
                    padding: 24px;
                }

                .dashboard__banner {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
                    border-radius: 14px;
                    margin-bottom: 24px;
                    padding: 28px 32px;
                }

                .dashboard__banner-title {
                    color: white;
                    font-size: 22px;
                    font-weight: 700;
                    margin-bottom: 6px;
                }

                .dashboard__banner-subtitle {
                    color: #94a3b8;
                    font-size: 14px;
                }

                .dashboard__grid {
                    display: grid;
                    gap: 16px;
                    grid-template-columns: repeat(4, 1fr);
                }

                .dashboard__state {
                    color: #64748b;
                    text-align: center;
                }

                .dashboard__error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    color: #dc2626;
                    padding: 12px 16px;
                }

                @media (max-width: 1024px) {
                    .dashboard__grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .dashboard__grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
