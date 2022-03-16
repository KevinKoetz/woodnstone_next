import type { NextPage } from "next";
import {useRouter} from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout";

const Index: NextPage = () => {
    const router = useRouter();
    useEffect(() => {
        router.push("/products");
    })
    return (
    <></>
  );
};

export default Index;