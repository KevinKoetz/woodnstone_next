import { AppBar, Typography, Container, Button } from "@mui/material";
import Link from "next/link"
import Logo from "./Logo";

function Footer() {
  return (
    <AppBar
      position="static"
      component="footer"
      sx={{
        background: "transparent",
        position: "relative",
        "&:before": {
          content: '""',
          display: "block",
          position: "absolute",
          inset: "0",
          background:
            "url(https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          filter: "brightness(0.4)",
        },
        "&:after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "0.5rem",
          transform: "translateY(-50%)",
          backdropFilter: "blur(0.1rem)",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ display: "flex", alignItems: "center" }}>
        <Logo
          width="73"
          height="49"
          viewBox="0 0 73 49"
          fill="none"
          fontSize="small"
          sx={{ mr: "0.5em", height: "100%", zIndex: 1}}
        />
        <Typography
          noWrap
          component="div"
          sx={{
            mr: 2,
            flexGrow: 1,
            zIndex: 1
          }}
        >
          Wood&apos;n Stone
        </Typography>
        <Link href={"/impressum"} passHref={true}>
        <Button
          size="small"
          sx={{
            color: "white",
            display: "block",
            textAlign: { xs: "start", md: "unset" },
          }}
        >
          Impressum
        </Button>
        </Link>
      </Container>
    </AppBar>
  );
}

export default Footer;
