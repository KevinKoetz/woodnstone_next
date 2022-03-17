import { RefObject, useLayoutEffect, useRef, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Button,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "./Logo";
import Link from "next/link";

interface HeaderProps {
  pages: string[];
}

const Header = ({ pages }: HeaderProps) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const ref: RefObject<HTMLDivElement> = useRef(null);

  const toggleNavMenu = () => {
    setIsNavOpen(!isNavOpen);
  };

  useLayoutEffect(() => {
    if (ref.current) setHeaderHeight(ref.current.clientHeight);
  }, [ref]);

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "transparent",

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
          bottom: 0,
          left: 0,
          right: 0,
          height: "0.5rem",
          transform: "translateY(50%)",
          backdropFilter: "blur(0.1rem)",
        },
      }}
    >
      <Container maxWidth="xl">
        <Collapse in={isNavOpen} collapsedSize={headerHeight}>
          <Toolbar
            disableGutters
            sx={{
              display: "grid",
              gridTemplateColumns: "auto auto 1fr",
              justifyItems: "flex-start",
            }}
          >
            <Logo
              width="73"
              height="49"
              viewBox="0 0 73 49"
              fill="none"
              fontSize="large"
              sx={{ mr: "0.5em", height: "100%" }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                flexGrow: 1,
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              ref={ref}
            >
              Wood&apos;n Stone
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={toggleNavMenu}
              color="inherit"
              sx={{
                display: { xs: "block", md: "none" },
                gridColumn: "3",
                justifySelf: "flex-end",
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                gridColumn: { xs: "1/4", md: "3" },
                justifySelf: { xs: "stretch", md: "flex-end" },
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              {pages.map((page) => (
                <Link
                  key={page}
                  href={`/${page.toLowerCase()}`}
                  passHref={true}
                >
                  <Button
                    sx={{
                      color: "white",
                      display: "block",
                      textAlign: { xs: "start", md: "unset" },
                    }}
                    onClick={() => setIsNavOpen(false)}
                  >
                    {page}
                  </Button>
                </Link>
              ))}
            </Box>
          </Toolbar>
        </Collapse>
      </Container>
    </AppBar>
  );
};
export default Header;
