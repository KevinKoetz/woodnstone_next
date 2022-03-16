import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { TextField, Paper, Select, MenuItem } from "@mui/material";

interface ProductDetailsProps {
  data: any;
  paths: {
    name: string;
    inputType: string;
    multiple: boolean;
    required?: boolean;
    min?: number;
    max?: number;
    minlength?: number;
    maxlength?: number;
    enum?: string[];
  }[];
  onSave: (data: FormData) => void;
  onDelete: (id: string) => void;
}

function DocumentDetails({ data, onSave, paths, onDelete }: ProductDetailsProps) {
  const [changedDocument, setChangedDocument] = useState(data);
  useEffect(() => setChangedDocument(data), [data]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (data._id) formData.append("_id", data._id);
    onSave(formData);
  };

  return (
    <Paper elevation={1}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {paths.map(
          ({
            inputType,
            multiple,
            name,
            required,
            max,
            maxlength,
            min,
            minlength,
            ...rest
          }) => {
            switch (inputType) {
              case "select":
                if (!rest.enum) return null;
                return (
                  <Select
                    required={data._id ? false : required}
                    value={changedDocument[name] ? changedDocument[name] : rest.enum[0]}
                    onChange={(e) =>
                      setChangedDocument({
                        ...changedDocument,
                        [name]: e.target.value,
                      })
                    }
                    label={name}
                    name={name}
                    id={name}
                    key={name}
                  >
                    {rest.enum.map((value) => (
                      <MenuItem value={value}>{value}</MenuItem>
                    ))}
                  </Select>
                );
              case "file":
                return (
                  <input
                    type="file"
                    required={data._id ? false : required}
                    id={name}
                    key={name}
                    name={name}
                    multiple={multiple}
                    value={changedDocument[name] ? undefined : ""}
                    onChange={(e) =>
                      setChangedDocument({
                        ...changedDocument,
                        [name]: e.target.value,
                      })
                    }
                  />
                );
              case "textarea":
                return (
                  <TextField
                    multiline={true}
                    required={data._id ? false : required}
                    autoComplete="new"
                    id={name}
                    key={name}
                    name={name}
                    label={name}
                    type={inputType}
                    value={changedDocument[name] ? changedDocument[name] : ""}
                    onChange={(e) =>
                      setChangedDocument({
                        ...changedDocument,
                        [name]: e.target.value,
                      })
                    }
                  />
                );
              case "email":
              case "text":
              case "password":
              case "number":
                return (
                  <TextField
                    required={data._id ? false : required}
                    autoComplete="new-password"
                    id={name}
                    key={name}
                    name={name}
                    label={name}
                    type={inputType}
                    value={changedDocument[name] ? changedDocument[name] : ""}
                    onChange={(e) =>
                      setChangedDocument({
                        ...changedDocument,
                        [name]: e.target.value,
                      })
                    }
                  />
                );
              default:
                return null;
            }
          }
        )}
        <Button type="submit">Save</Button>
        <Button onClick={() => setChangedDocument(data)}>Cancel</Button>
        <Button disabled={data._id ? false : true} variant="contained" color="error" onClick={() => onDelete(data._id)}>Delete</Button>
      </form>
    </Paper>
  );
}

export default DocumentDetails;
