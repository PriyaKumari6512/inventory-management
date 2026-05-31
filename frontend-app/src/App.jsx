import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Customers from "./pages/Customers.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import Products from "./pages/Products.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <div className="app">
                <Navbar />
                <main className="app__content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/orders" element={<Orders />} />
                    </Routes>
                </main>
            </div>
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    background: #f8fafc;
                    color: #0f172a;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                    margin: 0;
                    padding: 0;
                }

                .app {
                    min-height: 100vh;
                }

                .app__content {
                    margin: 0 auto;
                    max-width: 1280px;
                }
            `}</style>
        </BrowserRouter>
    );
};

export default App;
