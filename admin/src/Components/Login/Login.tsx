import { TextField, Button, Box } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/Auth";

export default function Login() {
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("email");
    const password = formData.get("password");
    if (!username || !password) return;
    if (typeof username !== "string" || typeof password !== "string")
      throw new Error("Expecting username and password to be strings!");
    if (await auth.signIn(username, password)) {
      navigate(from, { replace: true });
    } else {
      setError(true);
    }
  };

  return (
    <Box sx={{width: "100vw", height: "100vh", display: "grid", placeItems: "center"}}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <TextField
          required
          label="Email"
          type="email"
          name="email"
          error={error}
          helperText={error ? "Username or password invalid." : " "}
        />
        <TextField
          required
          label="Password"
          type="password"
          name="password"
          error={error}
          helperText={error ? "Username or password invalid." : " "}
        />
        <Button type="submit" variant="contained">
          Login
        </Button>
      </form>
    </Box>
  );
}
