import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <>
            <nav className="navbar">
                <div className="navbar__brand">
                    <span className="navbar__dot" />
                    Inventory Manager
                </div>
                <div className="navbar__links">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `navbar__link ${isActive ? "navbar__link--active" : ""}`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            `navbar__link ${isActive ? "navbar__link--active" : ""}`
                        }
                    >
                        Products
                    </NavLink>
                    <NavLink
                        to="/customers"
                        className={({ isActive }) =>
                            `navbar__link ${isActive ? "navbar__link--active" : ""}`
                        }
                    >
                        Customers
                    </NavLink>
                    <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                            `navbar__link ${isActive ? "navbar__link--active" : ""}`
                        }
                    >
                        Orders
                    </NavLink>
                </div>
            </nav>
            <style>{`
                .navbar {
                    align-items: center;
                    background: #0f172a;
                    border-bottom: 1px solid #1e3a5f;
                    display: flex;
                    height: 60px;
                    justify-content: space-between;
                    padding: 0 28px;
                }

                .navbar__brand {
                    align-items: center;
                    color: white;
                    display: flex;
                    font-size: 16px;
                    font-weight: 600;
                    gap: 8px;
                }

                .navbar__dot {
                    background: #2563eb;
                    border-radius: 50%;
                    display: inline-block;
                    height: 7px;
                    width: 7px;
                }

                .navbar__links {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                }

                .navbar__link {
                    color: #94a3b8;
                    font-size: 14px;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .navbar__link:hover {
                    color: white;
                }

                .navbar__link--active {
                    border-bottom: 2px solid #2563eb;
                    color: white;
                    padding-bottom: 4px;
                }

                @media (max-width: 640px) {
                    .navbar {
                        align-items: flex-start;
                        flex-direction: column;
                        height: auto;
                        padding: 12px 16px;
                    }

                    .navbar__links {
                        padding-top: 10px;
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;
