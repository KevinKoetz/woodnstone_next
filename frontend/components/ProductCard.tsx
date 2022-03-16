import {
  Button,
  CardContent,
  CardMedia,
  TextField,
  Typography,
} from "@mui/material";
import Card from "@mui/material/Card";
import { Box } from "@mui/system";

export interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  stock: number;
  maxOrderAmount: number;
  images: string[];
}

const ProductCard = ({
  name,
  description,
  price,
  stock,
  maxOrderAmount,
  images,
}: ProductCardProps) => {
  return (
    <Card sx={{ marginTop: 10, marginBottom: 10, maxWidth: 345 }}>
      <CardMedia component="img" height="140" image={images[0]} alt={""} />
      <CardContent>
        <Typography gutterBottom variant="h5" component={"div"}>
          {name}
        </Typography>
        <Typography variant="body2" color={"text.secondary"}>
          {description}
        </Typography>
      </CardContent>
  

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          p: 1,
          m: 1,
          bgcolor: "background.paper",
          borderRadius: 1,
        }}
       > 
           <TextField
      style={{width:"30%"}}
        id="outlined-number"
        label="Amount:"
        type="number"
        InputLabelProps={{ shrink: true }}
      />

        <Typography style={{marginTop:"5%"}}
        
        >{price}</Typography>

    
      
       <Button style={{width:"30%"}} size="medium">Add</Button>
      </Box>
    </Card>
  );
};

export default ProductCard;
