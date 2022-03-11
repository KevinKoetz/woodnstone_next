import "../styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const name = (Math.random() * 100).toString();
    const product = {
      description: "Holz",
      name: name,
      startingPrice: 100,
      stock: 10,
      maxOrderAmount: 50,
    };

    const formdata = new FormData(e.currentTarget);

    Object.entries(product).forEach((entry) => formdata.set(entry[0], typeof entry[1] === "number" ? entry[1].toString() : entry[1]));

    const config = {
      headers: { "content-type": "mulitpart/form-data" },
    };

    console.log("Handlesave: formdata is", formdata.keys());

    try {
      const response = await axios.post(
        "http://localhost:4000/product",
        formdata,
        config
      );
    } catch (error) {
      console.log(error);
      
    }
    


  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="images" />
      <input type="submit" />
    </form>
  );
}

export default MyApp;
