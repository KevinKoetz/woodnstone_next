import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { TextField, Paper, Select, MenuItem } from "@mui/material";
import { Can } from "@casl/react";
import { subject } from "@casl/ability";
import { useAbility } from "../Auth/Auth";

interface ProductDetailsProps {
  collectionName: string;
  data: Document
  paths: Path[];
  isNew?: boolean;
  onSave: (data: FormData) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

type PathValue = Document | Document[] | string | string[] | undefined;

interface Document {
  _id?: string;
  [pathname: string]: PathValue;
}


interface Path {
  name: string;
  inputType: string;
  multiple: boolean;
  subSchema?: { [pathName: string]: Path };
  required?: boolean;
  min?: number;
  max?: number;
  minlength?: number;
  maxlength?: number;
  enum?: string[];
}

function DocumentEditor({
  collectionName,
  data,
  isNew,
  onSave,
  paths,
  onDelete,
  onCancel,
}: ProductDetailsProps) {
  const [changedDocument, setChangedDocument] = useState(data);
  useEffect(() => setChangedDocument(data), [data]);
  console.log(data);

  const ability = useAbility();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(changedDocument).forEach(([key, value]) => {
      if (value !== data[key]) formData.append(key, value as any);
    });
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
          (
            {
              inputType,
              multiple,
              name,
              required,
              max,
              maxlength,
              min,
              minlength,
              ...rest
            },
            index
          ) => {
            if (
              Object.keys(data).length > 0 &&
              ability.cannot("read", subject(collectionName, { ...data }), name)
            )
              return null;
            return (
              <Input
                id={name}
                inputType={inputType}
                key={collectionName + name + index + Math.random()}
                label={name}
                multiple={multiple}
                name={name}
                onChange={(newValue) =>
                  setChangedDocument({ ...changedDocument, name: newValue })
                }
                options={rest.enum}
                required={required}
                value={changedDocument[name]}
              />
            );
          }
        )}
        <Can
          I={isNew ? "create" : "update"}
          this={subject(collectionName, { ...changedDocument })}
          ability={ability}
          passThrough
        >
          {(allowed: boolean) => (
            <Button disabled={!allowed} type="submit">
              {isNew ? "Create" : "Save"}
            </Button>
          )}
        </Can>
        <Button onClick={() => onCancel()}>Cancel</Button>
        {isNew ? null : (
          <Can
            I={"delete"}
            this={subject(collectionName, { ...data })}
            ability={ability}
            passThrough
          >
            {(allowed: boolean) => (
              <Button
                disabled={data._id && allowed ? false : true}
                variant="contained"
                color="error"
                onClick={() => onDelete(data._id ?? "")}
              >
                Delete
              </Button>
            )}
          </Can>
        )}
      </form>
    </Paper>
  );
}

function SubDocumentInput() {
  return <div>Subdocument Input here...</div>;
}

interface InputProps {
  inputType: string;
  label: string;
  multiple: boolean;
  options?: string[];
  required?: boolean;
  value: PathValue;
  onChange: (newValue: string) => void;
  id: string;
  name: string;
}


function Input({
  inputType,
  label,
  options,
  required,
  value,
  onChange,
  id,
  name,
  multiple,
}: InputProps) {
  switch (inputType) {
    case "select":
      if (!options) return null;
      if(typeof value !== "string" && value !== undefined) return null;
      return (
        <Select
          required={required}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          label={label}
          name={name}
          id={id}
        >
          {options.map((value) => (
            <MenuItem value={value}>{value}</MenuItem>
          ))}
        </Select>
      );
    case "file":
      return (
        <input
          type="file"
          required={required}
          id={id}
          name={name}
          multiple={multiple}
          value={value === "" ? value : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "textarea":
      if(typeof value !== "string") return null;
      return (
        <TextField
          multiline={true}
          required={required}
          autoComplete="new"
          id={id}
          name={name}
          label={label}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "subdocument":
      if(typeof value !== "object") return null;
      return <SubDocumentInput />;
    case "email":
    case "text":
    case "password":
    case "number":
      if(typeof value !== "string") return null;
      return (
        <TextField
          required={required}
          autoComplete="new-password"
          id={name}
          name={name}
          label={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return null;
  }
}

export default DocumentEditor;
