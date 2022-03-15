import {useState} from 'react';
import {Box, Button} from '@mui/material';
import Container from '@mui/material/Container';
import { TextField, Paper, IconButton } from '@mui/material';
import type {Product} from "../../../../../types";

interface ProductDetailsProps {
  details: Product;
  onSave: (changedProduct: Product) => void
}

 function ProductDetails({details, onSave}:ProductDetailsProps) { 
   const [changedProduct, setChangedProduct] = useState(details) 
  return (
    <Paper elevation={5}>
      <Container fixed>
        <Box sx={{  marginTop:'10vh', padding:'20px', maxHeight: '50vh' }} >
          {
            Object.entries(changedProduct).map(([key, value]) => <TextField id='outlined-basic' label={key} value={value} onChange={(e) => setChangedProduct({...changedProduct, [key]:e.target.value})}  />)
          }
          <Button onClick={() => onSave(changedProduct)}>Save</Button>
          <Button onClick={() => setChangedProduct(details)}>Cancel</Button>
 {/*            <TextField id='outlined-basic' label='Product name'  />
            <TextField id='outlined-basic' label='Description'  />
            <TextField id='outlined-basic' label='Starting Price'  />
            <TextField id='outlined-basic' label='Stock'  />
            <TextField id='outlined-basic' label='Max order amount'  />
            <TextField id='outlined-basic' label='Images'  />
              <IconButton color="primary" aria-label="upload picture" component="span">
          <PhotoCamera /> */}
            
        </Box>
        
      </Container>
    </Paper>
  );
}

export default ProductDetails
