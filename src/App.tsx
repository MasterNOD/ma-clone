import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import IntroducePage from "./pages/IntroducePage";
import ProductsPage from "./pages/ProductsPage";
import PriceTrackerPage from "./pages/PriceTrackerPage";
import SellsTrackerPage from "./pages/SellsTrackerPage";
import AboutUsPage from "./pages/AboutUsPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/introduce" element={<IntroducePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/price-tracker" element={<PriceTrackerPage />} />
        <Route path="/sells-tracker" element={<SellsTrackerPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="*" element={<Navigate to="/introduce" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;