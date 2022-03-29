import type { NextPage } from "next";
import { SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Contact: NextPage = () => {
  /* -------------------------------------------------------------------------- */
  /*                                 input stats                                */
  /* -------------------------------------------------------------------------- */

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  //Test submit button
  const [testSubmit, setTestSubmit] = useState("");

  /* -------------------------------------------------------------------------- */
  /*                             End Of Input States                            */
  /* -------------------------------------------------------------------------- */

  /* --------------- start Functions to handle the input stuff --------------- */
  // get info Functions
  const handleInfo = (
    func: (arg0: SetStateAction<string>) => void,
    e: SetStateAction<string>
  ) => {
    func(e);
  };

  // Test Submit Function FrontEnd
  const handleSubmitButton = () => {
    console.log("Full Name is:", fullName);
    console.log("The Email is:", email);
    console.log("The Message is:", message);
  };

  /* -------------------------- End of the Fucntions -------------------------- */

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        borderRadius: "0.4em",
        //change the input focus border colors
        "& .MuiTextField-root": { mb: 2, width: 1 },
        p: 5,
        mt: 5,
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h4" gutterBottom>
        Have a special request or Questions? Contact me!
      </Typography>
      <div>
        <TextField
          required
          label="Full Name"
          onChange={(e) => handleInfo(setFullName, e.target.value)}
        />
      </div>
      <div>
          
        <TextField required label="Email Address" onChange={(e) => handleInfo(setEmail, e.target.value)}  />
      </div>
      <div>
        <TextField
          id="outlined-textarea"
          label="Enter Your Message"
          rows={4}
          onChange={(e) => handleInfo(setMessage, e.target.value)}
          multiline
          required
        />
      </div>
      <Button
        variant="outlined"
        sx={{ py: 2, px: 5, alignSelf: "end" }}
        onClick={() => handleSubmitButton()}
      >
        Submit
      </Button>
    </Box>
  );
};

export default Contact;
