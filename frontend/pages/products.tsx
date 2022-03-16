import type { NextPage } from "next";
import Head from "next/head";
import Carousel from "../components/Carousel";
import Layout from "../components/Layout";

const Products: NextPage = () => {

  return (
     <div>
     <Carousel sx={{minHeight: "20rem", marginTop: "1rem"}}>
       {/* <div>Text1</div>
       <div>Text2</div>
       <div>Text3</div> */}
       <img src="https://picsum.photos/id/237/400/200" style={{objectFit: "cover", width: "100%", height: "100%", objectPosition: "center"}}/>
       <img src="https://picsum.photos/id/870/400/200" style={{objectFit: "cover", width: "100%",height: "100%", objectPosition: "center"}}/>
       <img src="https://picsum.photos/id/0/400/200" style={{objectFit: "cover", width: "100%",height: "100%", objectPosition: "center"}}/>
     </Carousel>
     </div>

  );
};

export default Products;
