import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
