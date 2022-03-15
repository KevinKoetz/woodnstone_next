import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { TextField } from '@mui/material';

 function PageLayout() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <Box sx={{  marginTop:'10vh', padding:'20px', maxHeight: '50vh' }} >
            <TextField id='outlined-basic' label='Product name'  />
            <TextField id='outlined-basic' label='Description'  />
            <TextField id='outlined-basic' label='Starting Price'  />
            <TextField id='outlined-basic' label='Stock'  />
            <TextField id='outlined-basic' label='Max order amount'  />
            <TextField id='outlined-basic' label='Images'  />
        </Box>
        
      </Container>
    </React.Fragment>
  );
}

export default PageLayout
