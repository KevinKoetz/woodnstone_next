import "./App.css";
import { useState, useEffect, useMemo } from "react";
import Layout from "./Components/Layout/Layout";
import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import RequireAuth from "./Components/RequireAuth/RequireAuth";
import Collection from "./Components/CollectionEditor/CollectionEditor";
import axios from "axios";
import { useAbility } from "./Components/Auth/Auth";
import { subject } from "@casl/ability";

function App() {
  const [schemas, setSchemas] = useState<{ [key: string]: any }>({});
  useEffect(() => {
    const getSchemas = async () => {
      const schemas = (await axios.get("/schemas")).data;
      setSchemas(schemas);
    };
    getSchemas();
  }, []);

  const ability = useAbility();
  
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout
                collections={Object.keys(schemas).filter(collection => ability.can("read", subject(collection, {})))}
              />
            </RequireAuth>
          }
        >
          {Object.entries(schemas).map(([name, schema]) =>
 (
              <Route
                key={name}
                path={name.toLowerCase()}
                element={
                  <RequireAuth>
                    <Collection
                      collectionName={name}
                      schema={schema}
                      endpoint={`/${name.toLowerCase()}`}
                    />
                  </RequireAuth>
                }
              />
            )
          )}
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
