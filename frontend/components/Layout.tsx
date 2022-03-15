import { Container, Box } from "@mui/material";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  children: JSX.Element;
}

const pages = ["Products", "References", "About", "Contact", "Cart"];

function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background:
          "url(https://images.unsplash.com/photo-1604411853851-8b4d5d910545?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)",
        backgroundSize: "cover",
      }}
    >
      <Header pages={pages} />
      <Container maxWidth="xl" sx={{ flexGrow: 1, overflow: "auto" }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
}

export default Layout;
