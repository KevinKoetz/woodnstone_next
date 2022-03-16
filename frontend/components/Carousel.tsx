import { Paper, PaperProps, IconButton, Fade, Box } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState } from "react";

interface CarouselProps extends PaperProps {
  children: JSX.Element[] | JSX.Element;
  transition?: number;
}

function Carousel({
  children,
  transition = 500,
  ...paperProps
}: CarouselProps) {
  const childrenIsArray = Array.isArray(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [inTransition, setInTransition] = useState(false);
  const mergedProps = Object.assign(paperProps, {
    style: { position: "relative", overflow: "hidden" },
  } as PaperProps);

  const showPrevious = () => {
    if(inTransition) return
    if (!Array.isArray(children)) return;
    const nextIndex =
      currentIndex === 0 ? children.length - 1 : currentIndex - 1;
    setNextIndex(nextIndex);
    setInTransition(true);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setInTransition(false);
    }, transition);
  };

  const showNext = () => {
    if(inTransition) return
    if (!Array.isArray(children)) return;
    const nextIndex =
      currentIndex === children.length - 1 ? 0 : currentIndex + 1;
    setNextIndex(nextIndex);
    setInTransition(true);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setInTransition(false);
    }, transition);
  };

  return (
    <Paper {...mergedProps}>
      {childrenIsArray ? (
        <IconButton
          sx={{
            position: "absolute",
            width: "minmax(10%, 1rem)",
            zIndex: 1,
            left: 0,
            top: 0,
            bottom: 0,
            borderRadius: 0,
            backgroundColor: "hsla(0,50%,0%,0.5)",
            color: "white",
            "&:hover": {
              backgroundColor: "hsla(0,0%,30%,0.5)",
              color: "white",
            },
          }}
          onClick={showPrevious}
        >
          <ChevronLeftIcon />
        </IconButton>
      ) : null}
      {childrenIsArray ? (
        <>
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {children[currentIndex]}
          </Box>
          <Fade
            enter={true}
            in={inTransition}
            appear={false}
            exit={false}
            timeout={transition}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {children[nextIndex]}
          </Fade>
        </>
      ) : null}

      {childrenIsArray ? (
        <IconButton
          sx={{
            position: "absolute",
            width: "minmax(10%, 1rem)",
            zIndex: 1,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 0,
            backgroundColor: "hsla(0,50%,0%,0.5)",
            color: "white",
            "&:hover": {
              backgroundColor: "hsla(0,0%,30%,0.5)",
              color: "white",
            },
          }}
          onClick={showNext}
        >
          <ChevronRightIcon />
        </IconButton>
      ) : null}
    </Paper>
  );
}

export default Carousel;
