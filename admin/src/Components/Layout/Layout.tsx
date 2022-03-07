import * as React from "react";
import { AppBar} from "@mui/material";
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
import { Routes, useNavigate, Route, Outlet } from "react-router-dom";
import { useState } from "react";


const drawerWidth = 240;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigate = useNavigate();

  const [header, setHeader] = useState('Orders')
  
  
  const drawer = (
    <div>
      <Toolbar />

      <List>
        <ListItem button onClick={() =>{ setMobileOpen(!mobileOpen); navigate("/"); setHeader('Orders')}}>
          <ListItemText primary="Orders" />
        </ListItem>

        <ListItem button onClick={() => {setMobileOpen(!mobileOpen) ;navigate("/products"); setHeader('Poducts')}}>
          <ListItemText primary="Products" />
        </ListItem>

        <ListItem button onClick={() => {setMobileOpen(!mobileOpen); navigate("/references"); setHeader('References')}}>
          <ListItemText primary="References" />
        </ListItem>

        <ListItem button onClick={() => {setMobileOpen(!mobileOpen); navigate("/pages"); setHeader('Pages')} }>
          <ListItemText primary="Pages" />
        </ListItem>

        <ListItem button onClick={() => {setMobileOpen(!mobileOpen); navigate("/users"); setHeader('Users')}}>
          <ListItemText primary="Users" />
        </ListItem>
      </List>
    </div>
  );
 
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {header}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
            display: { xs: "block", sm: "none" },
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
            display: { xs: "none", sm: "block" },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />

      <Outlet />
      </Box>
    </Box>
  );
}
