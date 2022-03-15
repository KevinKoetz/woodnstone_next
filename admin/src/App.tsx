import "./App.css";
import Layout from "./Components/Layout/Layout";
import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import { Provider as UserContextProvider } from "./Components/Auth/Auth";
import RequireAuth from "./Components/RequireAuth/RequireAuth";
import Products from "./Components/Products/Products";

function App() {
  
  return (
    <div className="App">
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="orders" element={<RequireAuth><div>Orders</div></RequireAuth>} />
            <Route path="products" element={<RequireAuth><Products /></RequireAuth>} />
            <Route path="references" element={<RequireAuth><div>References</div></RequireAuth>} />
            <Route path="pages" element={<RequireAuth><div> Pages </div></RequireAuth>} />
            <Route path="users" element={<RequireAuth><div> Users </div></RequireAuth>} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </UserContextProvider>
    </div>
  );
}

export default App;
