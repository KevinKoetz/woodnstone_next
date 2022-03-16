import "./App.css";
import {useState, useEffect} from "react"
import Layout from "./Components/Layout/Layout";
import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import { Provider as UserContextProvider } from "./Components/Auth/Auth";
import RequireAuth from "./Components/RequireAuth/RequireAuth";
import Collection from "./Components/Documents/Collection";
import axios from "axios";

function App() {
  const [schemas, setSchemas] = useState<{[key: string]: any}>({})
  useEffect(() => {
    const getSchemas = async () => {
      const schemas = (await axios.get("/schemas")).data
      setSchemas(schemas);
    }
    getSchemas()
  }, [])
  return (
    <div className="App">
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<RequireAuth><Layout pages={Object.keys(schemas).map(name => "/" + name.toLowerCase())} /></RequireAuth>}>
            {Object.keys(schemas).map(name => <Route key={name} path={name.toLowerCase()} element={<RequireAuth><Collection schema={schemas[name]} endpoint={`/${name.toLowerCase()}`} /></RequireAuth>} />)}
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </UserContextProvider>
    </div>
  );
}

export default App;
