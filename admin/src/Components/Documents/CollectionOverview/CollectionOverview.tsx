import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

interface CollectionOverviewProps {
  headers: string[]
  items: {_id:string, [key: string]: any}[]
  onSelectDocument: (id: string) => void;
}

function CollectionOverview({headers, items, onSelectDocument}: CollectionOverviewProps) {
 
  const rows: GridRowsProp = items.map(item => {
    return {...item,id: item._id}
  });
  
  const columns: GridColDef[] = headers.map(header => {
    return {field: header, headerName: header, width: 150 }
  })
  
  return (
    <div style={{ height: 300, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} onRowClick={(a) => onSelectDocument(a.id.toString())}/>
    </div>
  );
}

export default CollectionOverview;
