import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Product } from "../../types";
import Carousel from "../components/Carousel";
import Layout from "../components/Layout";
import ProductCard, { ProductCardProps } from "../components/ProductCard";
import axios from "axios";
import { Box } from "@mui/material";

const products: ProductCardProps[] = [
  {
    name: "Holz1234",
    description: `Some quick example text to build on the card title and make up the bulk of the card's content.`,
    price: 1499,
    maxOrderAmount: 5,
    stock: 3,
    images: [
      "https://picsum.photos/id/237/400/200",
      "https://picsum.photos/id/870/400/200",
    ],
  },
];
const Products: NextPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetchProduct = async () => {
      const products = (await axios.get("http://localhost:4000/product")).data;
      setProducts(products);
    };
    fetchProduct();
  }, []);

  return (
    <div>
      <Carousel sx={{ minHeight: "20rem", marginTop: "1rem" }}>
        {/* <div>Text1</div>
       <div>Text2</div>
       <div>Text3</div> */}
        <img
          src="https://picsum.photos/id/237/400/200"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            objectPosition: "center",
          }}
        />
        <img
          src="https://picsum.photos/id/870/400/200"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            objectPosition: "center",
          }}
        />
        <img
          src="https://picsum.photos/id/0/400/200"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            objectPosition: "center",
          }}
        />
      </Carousel>

      <Box
        sx={{
          marginBottom:"3rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          marginTop:"1rem"
        }}
      >
        {products.map((ProductProps) => (
          <ProductCard
            key={ProductProps._id}
            {...ProductProps}
            price={ProductProps.startingPrice}
          />
        ))}
      </Box>
    </div>
  );
};

export default Products;
