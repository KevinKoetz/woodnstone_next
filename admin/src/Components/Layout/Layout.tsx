import { AppBar } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAbility, useAuth } from "../Auth/Auth";

const drawerWidth = 240;

interface LayoutProps {
  collections: string[];
}

export default function Layout({ collections }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();

  const ability = useAbility();
  console.log("abilits is:",ability);
  

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigate = useNavigate();

  const location = useLocation();

  const toCapitalize = (string: string) => {
    return string.length > 0 ? string[0].toUpperCase() + string.slice(1) : "";
  };

  useEffect(() => {
    if(!location) return;
    if (location?.pathname === "/" && collections.length !== 0) return navigate(collections[0]);
  }, [location, navigate, collections]);

  const drawer = (
    <div>
      <Toolbar />

      <List>
        {collections.map((collection) => (
           <ListItem
            key={collection}
            button
            onClick={() => {
              setMobileOpen(!mobileOpen);
              navigate("/" + collection.toLowerCase());
            }}
          >
            <ListItemText primary={toCapitalize(collection.replace("/", ""))} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{display:"flex", justifyContent:"space-between"}} >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {toCapitalize(location?.pathname.replace("/", "") ?? "")}
          </Typography>
          <IconButton
            
            onClick={signOut}
            color="inherit"
            edge="end"
            aria-label="logout"
          >
            <LogoutIcon />
            <Typography style={{ marginLeft: "0.3rem" }} variant="h6">
              Logout
            </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={window.document.body}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
}
