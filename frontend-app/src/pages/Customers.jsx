import { useEffect, useState } from "react";

import { createCustomer, deleteCustomer, getCustomers } from "../api/index.js";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadCustomers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getCustomers();
            setCustomers(response.data || []);
        } catch (fetchError) {
            setError("Failed to load customers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ full_name: "", email: "", phone: "" });
    };

    const handleAddCustomer = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        try {
            await createCustomer({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || null,
            });
            setMessage("Customer added successfully.");
            resetForm();
            await loadCustomers();
        } catch (createError) {
            const detail = createError?.response?.data?.detail;
            if (detail === "Email already exists") {
                setError(detail);
            } else {
                setError("Failed to add customer.");
            }
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = window.confirm("Delete this customer?");
        if (!shouldDelete) {
            return;
        }

        setError("");
        setMessage("");
        try {
            await deleteCustomer(id);
            setMessage("Customer deleted successfully.");
            await loadCustomers();
        } catch (deleteError) {
            setError("Failed to delete customer.");
        }
    };

    return (
        <div className="customers">
            <div className="customers__title">Customers</div>

            {message ? <div className="customers__message">{message}</div> : null}
            {error ? (
                <div className="customers__message customers__message--error">
                    {error}
                </div>
            ) : null}

            <div className="customers__card">
                <div className="customers__card-title">Add New Customer</div>
                <form className="customers__form" onSubmit={handleAddCustomer}>
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Add Customer</button>
                </form>
            </div>

            {loading ? (
                <div className="customers__loading">Loading customers...</div>
            ) : (
                <div className="customers__table-card">
                    <table className="customers__table">
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, index) => {
                                const rowClass = index % 2 === 0 ? "row-even" : "row-odd";
                                return (
                                    <tr key={customer.id} className={rowClass}>
                                        <td>{customer.full_name}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone || "-"}</td>
                                        <td className="customers__actions">
                                            <button
                                                type="button"
                                                className="customers__btn customers__btn--delete"
                                                onClick={() => handleDelete(customer.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .customers {
                    padding: 24px;
                }

                .customers__title {
                    border-left: 3px solid #2563eb;
                    color: #0f172a;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 14px;
                    padding-left: 10px;
                }

                .customers__message {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    color: #059669;
                    margin-bottom: 12px;
                    padding: 10px 14px;
                }

                .customers__message--error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }

                .customers__card {
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    padding: 20px;
                }

                .customers__card-title {
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 12px;
                }

                .customers__form {
                    display: grid;
                    gap: 10px;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                }

                .customers__form input {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 12px;
                }

                .customers__form input:focus {
                    outline: 2px solid #2563eb;
                }

                .customers__form button {
                    background: #2563eb;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    padding: 8px 16px;
                    transition: background 0.2s ease;
                }

                .customers__form button:hover {
                    background: #1d4ed8;
                }

                .customers__loading {
                    color: #64748b;
                }

                .customers__table-card {
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-radius: 12px;
                    overflow-x: auto;
                }

                .customers__table {
                    border-collapse: collapse;
                    font-size: 13px;
                    width: 100%;
                }

                .customers__table th {
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                    padding: 10px 14px;
                    text-align: left;
                    text-transform: uppercase;
                }

                .customers__table td {
                    border-bottom: 0.5px solid #e2e8f0;
                    padding: 10px 14px;
                }

                .row-even {
                    background: #f8fafc;
                }

                .row-odd {
                    background: #ffffff;
                }

                .customers__actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .customers__btn {
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    padding: 6px 12px;
                    transition: all 0.2s ease;
                }

                .customers__btn--delete {
                    background: #dc2626;
                    color: white;
                }

                .customers__btn--delete:hover {
                    background: #b91c1c;
                }
            `}</style>
        </div>
    );
};

export default Customers;
