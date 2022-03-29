import DocumentEditor from "../DocumentEditor/DocumentEditor";
import DocumentsOverview from "./CollectionOverview/CollectionOverview";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/Auth";
import { Button } from "@mui/material";
import { Box } from "@mui/system";

interface CollectionProps {
  collectionName: string;
  schema: Schema;
  endpoint: string;
}

type Schema =
  | {
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
    }
  | {
      [key: string]: {
        type: [Schema] | Schema;
        inputType: "subdocument";
        required?: boolean;
        unique?: boolean;
        min?: number;
        max?: number;
        minlength?: number;
        important?: boolean;
        enum?: string[];
      };
    };

function Collection({ collectionName, schema, endpoint }: CollectionProps) {
  const { token } = useAuth();
  const [collection, setCollection] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [createNew, setCreateNew] = useState(false);

  useEffect(() => {
    setData(null);
    setCollection([]);
  }, [schema]);

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
    const response = await axios.delete(endpoint + "/" + id, {
      headers: { Authorization: "Bearer " + token },
      validateStatus: () => true,
    });

    switch (response.status) {
      case 200:
        setData(null);
        setCollection(collection.filter((doc) => doc._id !== id));
        return;
      case 403:
        return "forbidden";
    }
  };

  const handleSelectDocument = async (id: string) => {
    setCreateNew(false);
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
    <Box>
      <DocumentsOverview
        headers={Object.keys(schema).filter((path) => schema[path].important)}
        items={collection}
        onSelectDocument={handleSelectDocument}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          style={{ marginTop: "2vh", marginBottom: "5vh" }}
          variant="contained"
          onClick={() => setCreateNew(true)}
        >
          Add new
        </Button>
      </Box>

      {data || createNew ? (
        <DocumentEditor
          collectionName={collectionName}
          data={createNew ? {} : data}
          onCancel={() => {
            setData(null);
            setCreateNew(false);
          }}
          isNew={createNew}
          onSave={handleDocumentSave}
          onDelete={handleDeleteDocument}
          paths={Object.entries(schema).map(([key, { type, ...rest }]) => {
            return {
              name: key,
              multiple: Array.isArray(type),
              subSchema:
                rest.inputType === "subdocument" && Array.isArray(type)
                  ? type[0]
                  : type,
              ...rest,
            };
          })}
        />
      ) : null}
    </Box>
  );
}

export default Collection;
