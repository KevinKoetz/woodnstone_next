import "./App.css";
import Layout from "./Components/Layout/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Orders</div>} />
          <Route path="/products" element={<div>Products</div>} />
          <Route path="/references" element={<div>References</div>} />
          <Route path="/pages" element={<div> Pages </div>} />
          <Route path="/users" element={<div> Users </div>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
