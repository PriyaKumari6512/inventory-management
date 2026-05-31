import { useEffect, useState } from "react";

import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from "../api/index.js";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        price: "",
        quantity: 0,
    });
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        sku: "",
        price: "",
        quantity: 0,
    });

    const loadProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getProducts();
            setProducts(response.data || []);
        } catch (fetchError) {
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
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

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ name: "", sku: "", price: "", quantity: 0 });
    };

    const handleAddProduct = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        try {
            await createProduct({
                name: formData.name,
                sku: formData.sku,
                price: Number(formData.price),
                quantity: Number(formData.quantity),
            });
            setMessage("Product added successfully.");
            resetForm();
            await loadProducts();
        } catch (createError) {
            setError("Failed to add product.");
        }
    };

    const startEdit = (product) => {
        setEditId(product.id);
        setEditData({
            name: product.name,
            sku: product.sku,
            price: product.price,
            quantity: product.quantity,
        });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditData({ name: "", sku: "", price: "", quantity: 0 });
    };

    const handleSaveEdit = async (id) => {
        setError("");
        setMessage("");
        try {
            await updateProduct(id, {
                name: editData.name,
                sku: editData.sku,
                price: Number(editData.price),
                quantity: Number(editData.quantity),
            });
            setMessage("Product updated successfully.");
            cancelEdit();
            await loadProducts();
        } catch (updateError) {
            setError("Failed to update product.");
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = window.confirm("Delete this product?");
        if (!shouldDelete) {
            return;
        }

        setError("");
        setMessage("");
        try {
            await deleteProduct(id);
            setMessage("Product deleted successfully.");
            await loadProducts();
        } catch (deleteError) {
            setError("Failed to delete product.");
        }
    };

    return (
        <div className="products">
            <div className="products__title">Products</div>

            {message ? <div className="products__message">{message}</div> : null}
            {error ? (
                <div className="products__message products__message--error">
                    {error}
                </div>
            ) : null}

            <div className="products__card">
                <div className="products__card-title">Add New Product</div>
                <form className="products__form" onSubmit={handleAddProduct}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="sku"
                        placeholder="SKU"
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                    />
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        required
                    />
                    <button type="submit">Add Product</button>
                </form>
            </div>

            {loading ? (
                <div className="products__loading">Loading products...</div>
            ) : (
                <div className="products__table-card">
                    <table className="products__table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => {
                                const isLowStock = product.quantity < 5;
                                const isEditing = editId === product.id;
                                const rowClass = index % 2 === 0 ? "row-even" : "row-odd";

                                if (isEditing) {
                                    return (
                                        <tr key={product.id} className={rowClass}>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editData.name}
                                                    onChange={handleEditChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="sku"
                                                    value={editData.sku}
                                                    onChange={handleEditChange}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={editData.price}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={editData.quantity}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                />
                                            </td>
                                            <td className="products__actions">
                                                <button
                                                    type="button"
                                                    className="products__btn products__btn--save"
                                                    onClick={() => handleSaveEdit(product.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="products__btn products__btn--cancel"
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr
                                        key={product.id}
                                        className={`${rowClass} ${
                                            isLowStock ? "products__row--low" : ""
                                        }`}
                                    >
                                        <td>{product.name}</td>
                                        <td>{product.sku}</td>
                                        <td>${Number(product.price).toFixed(2)}</td>
                                        <td>
                                            {product.quantity}
                                            {isLowStock ? (
                                                <span className="products__badge">Low Stock</span>
                                            ) : null}
                                        </td>
                                        <td className="products__actions">
                                            <button
                                                type="button"
                                                className="products__btn products__btn--edit"
                                                onClick={() => startEdit(product)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="products__btn products__btn--delete"
                                                onClick={() => handleDelete(product.id)}
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
                .products {
                    padding: 24px;
                }

                .products__title {
                    border-left: 3px solid #2563eb;
                    color: #0f172a;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 14px;
                    padding-left: 10px;
                }

                .products__message {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    color: #059669;
                    margin-bottom: 12px;
                    padding: 10px 14px;
                }

                .products__message--error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }

                .products__card {
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    padding: 20px;
                }

                .products__card-title {
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 12px;
                }

                .products__form {
                    display: grid;
                    gap: 10px;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                }

                .products__form input {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 12px;
                }

                .products__form input:focus {
                    outline: 2px solid #2563eb;
                }

                .products__form button {
                    background: #2563eb;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    padding: 8px 16px;
                    transition: background 0.2s ease;
                }

                .products__form button:hover {
                    background: #1d4ed8;
                }

                .products__loading {
                    color: #64748b;
                }

                .products__table-card {
                    background: #ffffff;
                    border: 0.5px solid #e2e8f0;
                    border-radius: 12px;
                    overflow-x: auto;
                }

                .products__table {
                    border-collapse: collapse;
                    font-size: 13px;
                    width: 100%;
                }

                .products__table th {
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                    padding: 10px 14px;
                    text-align: left;
                    text-transform: uppercase;
                }

                .products__table td {
                    border-bottom: 0.5px solid #e2e8f0;
                    padding: 10px 14px;
                }

                .row-even {
                    background: #f8fafc;
                }

                .row-odd {
                    background: #ffffff;
                }

                .products__row--low {
                    background: #fff7ed;
                }

                .products__badge {
                    background: #fff7ed;
                    border: 1px solid #fed7aa;
                    border-radius: 20px;
                    color: #d97706;
                    font-size: 11px;
                    margin-left: 8px;
                    padding: 2px 8px;
                }

                .products__actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .products__btn {
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    padding: 6px 12px;
                    transition: all 0.2s ease;
                }

                .products__btn--edit {
                    background: white;
                    border: 1px solid #2563eb;
                    color: #2563eb;
                }

                .products__btn--edit:hover {
                    background: #eff6ff;
                }

                .products__btn--delete {
                    background: #dc2626;
                    color: white;
                }

                .products__btn--delete:hover {
                    background: #b91c1c;
                }

                .products__btn--save {
                    background: #059669;
                    color: white;
                }

                .products__btn--save:hover {
                    background: #047857;
                }

                .products__btn--cancel {
                    background: #94a3b8;
                    color: white;
                }

                .products__btn--cancel:hover {
                    background: #64748b;
                }

                .products__table input {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 6px 8px;
                }

                .products__table input:focus {
                    outline: 2px solid #2563eb;
                }
            `}</style>
        </div>
    );
};

export default Products;
