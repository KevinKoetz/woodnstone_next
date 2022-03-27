import type { NextPage } from "next";
import Head from "next/head";
import { SetStateAction, useState } from "react";
import Layout from "../components/Layout";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { styled } from "@mui/system";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Contact: NextPage = () => {
  // NOTE Style from Kevin prevoius contact us page
  const inputFocusColor = "#d8bba0";
  const submitBtnColor = "#b07640"; // also apply border-color


  const CustomSubmitButton = styled(Button)({
    width: "fit-content",
    alignSelf: "end",
    border: `2px solid ${submitBtnColor}`,
    color: submitBtnColor,
    right: 0,
    "&:hover": {
      border: `2px solid ${submitBtnColor}`,
      background: submitBtnColor,
      color: "#fff",
    },
  });

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
    // <div style={{ backgroundColor: "#fff", marginTop: "40px" }}>
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        // change the label text color
        "& label.Mui-focused": {
          color: inputFocusColor,
        },
        borderRadius: "0.4em",

        //change the input focus border colors
        "& .MuiTextField-root": { mb: 2, width: 1 },
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: inputFocusColor,
          },
        },
        p: 5,
        mt: 5,
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h4" gutterBottom component="div">
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
        {/* <MyComponent
            aria-label="Your message"
            minRows={5}
            placeholder="Enter your message here"
          /> */}
        <TextField
          id="outlined-textarea"
          label="Enter Your Message"
          rows={4}
          // placeholder="Enter you message"
          onChange={(e) => handleInfo(setMessage, e.target.value)}
          multiline
          required
        />
      </div>
      <CustomSubmitButton
        variant="outlined"
        sx={{ py: 2, px: 5 }}
        onClick={(e) => handleSubmitButton()}
      >
        Submit
      </CustomSubmitButton>
    </Box>
    // </div>
  );
};

export default Contact;
