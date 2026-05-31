import { useEffect, useMemo, useState } from "react";

import {
    createOrder,
    deleteOrder,
    getCustomers,
    getOrders,
    getProducts,
} from "../api/index.js";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({
        customer_id: "",
        product_id: "",
        quantity: 1,
    });

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [ordersResponse, customersResponse, productsResponse] =
                await Promise.all([getOrders(), getCustomers(), getProducts()]);
            setOrders(ordersResponse.data || []);
            setCustomers(customersResponse.data || []);
            setProducts(productsResponse.data || []);
        } catch (fetchError) {
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!message && !error) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, error]);

    const customerLookup = useMemo(() => {
        return customers.reduce((acc, customer) => {
            acc[customer.id] = customer.full_name;
            return acc;
        }, {});
    }, [customers]);

    const productLookup = useMemo(() => {
        return products.reduce((acc, product) => {
            acc[product.id] = product.name;
            return acc;
        }, {});
    }, [products]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        try {
            await createOrder({
                customer_id: Number(formData.customer_id),
                product_id: Number(formData.product_id),
                quantity: Number(formData.quantity),
            });
            setMessage("Order placed successfully.");
            setFormData({ customer_id: "", product_id: "", quantity: 1 });
            await loadData();
        } catch (createError) {
            const detail = createError?.response?.data?.detail;
            if (detail) {
                setError(detail);
            } else {
                setError("Failed to place order.");
            }
        }
    };

    const handleCancel = async (id) => {
        const shouldCancel = window.confirm("Cancel this order?");
        if (!shouldCancel) {
            return;
        }

        setError("");
        setMessage("");
        try {
            await deleteOrder(id);
            setMessage("Order cancelled successfully.");
            await loadData();
        } catch (deleteError) {
            setError("Failed to cancel order.");
        }
    };

    return (
        <div className="orders">
            <div className="orders__title">Orders</div>

            {message ? <div className="orders__message">{message}</div> : null}
            {error ? (
                <div className="orders__message orders__message--error">{error}</div>
            ) : null}

            <div className="orders__card">
                <div className="orders__card-title">Place New Order</div>
                <form className="orders__form" onSubmit={handlePlaceOrder}>
                    <select
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select customer</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.full_name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select product</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} ({product.quantity} in stock)
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">Place Order</button>
                </form>
            </div>

            {loading ? (
                <div className="orders__loading">Loading orders...</div>
            ) : (
                <div className="orders__table-card">
                    <table className="orders__table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const rowClass = index % 2 === 0 ? "row-even" : "row-odd";
                                return (
                                    <tr key={order.id} className={rowClass}>
                                        <td>#{order.id}</td>
                                        <td>{customerLookup[order.customer_id] || "-"}</td>
                                        <td>{productLookup[order.product_id] || "-"}</td>
                                        <td>{order.quantity}</td>
                                        <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                                        <td>
                                            <span className="orders__status">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="orders__actions">
                                            <button
                                                type="button"
                                                className="orders__btn orders__btn--details"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                type="button"
                                                className="orders__btn orders__btn--cancel"
                                                onClick={() => handleCancel(order.id)}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder ? (
                <div className="orders__modal-overlay">
                    <div className="orders__modal">
                        <button
                            type="button"
                            className="orders__modal-close"
                            onClick={() => setSelectedOrder(null)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h2 className="orders__modal-title">Order Details</h2>
                        <div className="orders__modal-row">
                            <span>Order ID</span>
                            <span>#{selectedOrder.id}</span>
                        </div>
                        <div className="orders__modal-row">
                            <span>Customer Name</span>
                            <span>
                                {customerLookup[selectedOrder.customer_id] || "-"}
                            </span>
                        </div>
                        <div className="orders__modal-row">
                            <span>Product Name</span>
                            <span>
                                {productLookup[selectedOrder.product_id] || "-"}
                            </span>
                        </div>
                        <div className="orders__modal-row">
                            <span>Quantity</span>
                            <span>{selectedOrder.quantity}</span>
                        </div>
                        <div className="orders__modal-row">
                            <span>Total Amount</span>
                            <span>
                                ${Number(selectedOrder.total_amount || 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="orders__modal-row orders__modal-row--last">
                            <span>Status</span>
                            <span>{selectedOrder.status}</span>
                        </div>
                    </div>
                </div>
            ) : null}

            <style>{`
                .orders {
                    padding: 24px;
                }

                .orders__title {
                    border-left: 3px solid #2563eb;
                    color: #0f172a;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 14px;
                    padding-left: 10px;
                }

                .orders__message {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    color: #059669;
                    margin-bottom: 12px;
                    padding: 10px 14px;
                }

                .orders__message--error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }

                .orders__card {
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    padding: 20px;
                }

                .orders__card-title {
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 12px;
                }

                .orders__form {
                    display: grid;
                    gap: 10px;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                }

                .orders__form select,
                .orders__form input {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 12px;
                }

                .orders__form select:focus,
                .orders__form input:focus {
                    outline: 2px solid #2563eb;
                }

                .orders__form button {
                    background: #2563eb;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    padding: 8px 16px;
                    transition: background 0.2s ease;
                }

                .orders__form button:hover {
                    background: #1d4ed8;
                }

                .orders__loading {
                    color: #64748b;
                }

                .orders__table-card {
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-radius: 12px;
                    overflow-x: auto;
                }

                .orders__table {
                    border-collapse: collapse;
                    font-size: 13px;
                    width: 100%;
                }

                .orders__table th {
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                    padding: 10px 14px;
                    text-align: left;
                    text-transform: uppercase;
                }

                .orders__table td {
                    border-bottom: 0.5px solid #e2e8f0;
                    padding: 10px 14px;
                }

                .row-even {
                    background: #f8fafc;
                }

                .row-odd {
                    background: #ffffff;
                }

                .orders__actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .orders__btn {
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    padding: 6px 12px;
                    transition: all 0.2s ease;
                }

                .orders__btn--details {
                    background: #2563eb;
                    color: white;
                }

                .orders__btn--details:hover {
                    background: #1d4ed8;
                }

                .orders__btn--cancel {
                    background: #dc2626;
                    color: white;
                }

                .orders__btn--cancel:hover {
                    background: #b91c1c;
                }

                .orders__status {
                    background: #f0fdf4;
                    border-radius: 20px;
                    color: #059669;
                    display: inline-block;
                    font-size: 11px;
                    padding: 2px 8px;
                }

                .orders__modal-overlay {
                    align-items: center;
                    animation: fadeIn 0.2s ease;
                    background: rgba(0, 0, 0, 0.55);
                    display: flex;
                    inset: 0;
                    justify-content: center;
                    position: fixed;
                    z-index: 10;
                }

                .orders__modal {
                    background: white;
                    border-radius: 14px;
                    max-width: 440px;
                    padding: 28px;
                    position: relative;
                    width: calc(100% - 32px);
                }

                .orders__modal-title {
                    color: #0f172a;
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 20px;
                }

                .orders__modal-row {
                    border-bottom: 0.5px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                }

                .orders__modal-row span:first-child {
                    color: #64748b;
                    font-size: 13px;
                }

                .orders__modal-row span:last-child {
                    color: #0f172a;
                    font-size: 13px;
                    font-weight: 500;
                }

                .orders__modal-row--last {
                    border-bottom: none;
                }

                .orders__modal-close {
                    background: #f1f5f9;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    height: 28px;
                    position: absolute;
                    right: 16px;
                    top: 16px;
                    width: 28px;
                }

                .orders__modal-close:hover {
                    background: #e2e8f0;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Orders;
