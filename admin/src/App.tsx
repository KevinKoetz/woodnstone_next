import "./App.css";
import Layout from "./Components/Layout/Layout";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Switch from "react-switch";
function App() {
  return (
    <Router>
      <div className="App">
        <Layout />
      </div>
    </Router>
  );
}

export default App;
