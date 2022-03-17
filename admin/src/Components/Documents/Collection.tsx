import DocumentDetails from "./DocumentDetails/DocumentDetails";
import DocumentsOverview from "./CollectionOverview/CollectionOverview";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/Auth";
import { Button } from "@mui/material";
import { Box } from "@mui/system";

interface CollectionProps {
  schema: {
    [key: string]: {
      type: string | string[];
      inputType: string;
      required?: boolean;
      unique?: boolean;
      min?: number;
      max?: number;
      minlength?: number;
      important?: boolean;
      enum?: string[];
    };
  };
  endpoint: string;
}

function Collection({ schema, endpoint }: CollectionProps) {
  const defaultDocument = useMemo(() => {
    return {};
  }, []);
  const { token } = useAuth();
  const [collection, setCollection] = useState<any[]>([]);
  const [data, setData] = useState(defaultDocument);

  useEffect(() => {
    setData(defaultDocument);
  }, [schema, defaultDocument]);

  useEffect(() => {
    const retrieveDocuments = async () => {
      const response = await axios.get(endpoint, {
        headers: { Authorization: "Bearer " + token },
      });
      setCollection(response.data);
    };
    retrieveDocuments();
  }, [endpoint, token]);

  const handleDocumentSave = async (data: FormData) => {
    const id = data.get("_id");
    if (id) {
      const response = await axios.patch(endpoint + "/" + id, data, {
        headers: { Authorization: "Bearer " + token },
      });
      setCollection(
        collection.map((doc) =>
          doc._id === response.data._id ? response.data : doc
        )
      );
    } else {
      const response = await axios.post(endpoint, data, {
        headers: { Authorization: "Bearer " + token },
      });
      setCollection([...collection, response.data]);
      setData(response.data);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    axios.delete(endpoint + "/" + id, {
      headers: { Authorization: "Bearer " + token },
    });
    setData({});
    setCollection(collection.filter((doc) => doc._id !== id));
  };

  const handleSelectDocument = async (id: string) => {
    setData(collection.find((document) => document._id === id));
    const response = await axios.get(endpoint + "/" + id, {
      headers: { Authorization: "Bearer " + token },
    });
    setData(response.data);
    setCollection(
      collection.map((doc) =>
        doc._id === response.data._id ? response.data : doc
      )
    );
  };

  return (
    <>
      <DocumentsOverview
        headers={Object.keys(schema).filter((path) => schema[path].important)}
        items={collection}
        onSelectDocument={handleSelectDocument}
      />
      <Box sx={{ display: "flex", justifyContent:"flex-end" }}>
        <Button
          style={{ marginTop: "2vh", marginBottom:"5vh" }}
          variant="contained"
          onClick={() => setData({})}
        >
          Add new
        </Button>
      </Box>
      <DocumentDetails
        data={data}
        onSave={handleDocumentSave}
        onDelete={handleDeleteDocument}
        paths={Object.entries(schema).map(([key, { type, ...rest }]) => {
          return { name: key, multiple: Array.isArray(type), ...rest };
        })}
      />
    </>
  );
}

export default Collection;
