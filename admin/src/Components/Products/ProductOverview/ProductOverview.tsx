import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

interface ProductOverview {
  headers: string[]
  items: {_id:string, [key: string]: any}[]
}

function ProductOveriew({headers, items}: ProductOverview) {
 
  const rows: GridRowsProp = items.map(item => {
    return {...item,id: item._id}
  });
  
  
  /* [
    { id: 1, col1: "placeholder", col2: "placeholder", col3:"placeholder",col4:"placeholder", col5:"placeholder" },
  
  ]; */
  
  const columns: GridColDef[] = headers.map(header => {
    return {field: header, headerName: header, width: 150 }
  })
  
  
 /*  [
    { field: "col1", headerName: "Name", width: 150 },
    { field: "col2", headerName: "Description", width: 150 },
    { field: "col3", headerName: "Starting price", width: 150 },
    { field: "col4", headerName: "Stock", width: 150 },
    { field: "col5", headerName: "Max order amount", width: 150 },
    
  ]; */
  return (
    <div style={{ height: 300, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
}

export default ProductOveriew;
