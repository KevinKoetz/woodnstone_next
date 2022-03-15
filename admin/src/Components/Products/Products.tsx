import ProductDetails from "./ProductDetails/ProductDetails";
import ProductOverview from "./ProductOverview/ProductOverview";
import type { Product } from "../../../../types";
import { useEffect, useState } from "react";
import axios from "axios";

interface ProductsProps {
  schema: {
    [key: string]:
      | {
          type: string | string[];
          required?: boolean;
          unique?: boolean;
          min?: number;
          max?: number;
          minlength?: number;
        }
      | string;
  };
}

function Products({ schema }: ProductsProps) {
  const [data, setData] = useState<Product[]>([]);
  console.log(schema);
  
  useEffect(() => {
    const retreiveData = async () => {
      const response = await axios.get("/product");
      setData(response.data);
    };
    retreiveData();
  }, []);

  const defaultProduct: Product = {
    description: "",
    images: [],
    maxOrderAmount: 1,
    name: "",
    startingPrice: 100,
    stock: 1,
    _id: "",
  };
  const handleProductSave = (product: Product) => {
    console.log(product);
  };
  return (
    <>
      <ProductOverview headers={Object.keys(schema)} items={data}/>
      <ProductDetails details={defaultProduct} onSave={handleProductSave} />
    </>
  );
}

export default Products;
