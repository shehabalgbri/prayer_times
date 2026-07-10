import "./App.css";
import { createTheme, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import PrayerProject from "./prayerProject";
import { useEffect, useContext, useMemo } from "react";
import ThemeContext from "./context/ThemeContext";
function App() {
  const { theme } = useContext(ThemeContext);
  const themeMaterial = useMemo(() => createTheme({
    direction: "rtl",
    palette: {
      mode: theme === "dark" ? "dark" : "light",
      primary: {
        main: "#a47e55",
      },
      background: {
        default: theme === "dark" ? "#1a0e06" : "#FFFDF8",
        paper: theme === "dark" ? "#1a0e06" : "#FFFDF8",
      },
      text: {
        primary: theme === "dark" ? "#f2e8cb" : "#4e2a16",
        secondary: theme === "dark" ? "#a47e55" : "#4e2a16",
      },
    },
    typography: {
      fontFamily: '"Amiri", "Noto Kufi Arabic", serif',
    },
  }), [theme]);
  useEffect(() => {
    document.body.style.transition = "background-color 0.3s ease";
    if (theme === "light") {
      document.body.style.backgroundColor = "#FFFDF8";
      document.documentElement.style.setProperty("--scrollbar-thumb-color", "#3a5450");
      document.documentElement.style.setProperty("--scrollbar-track-color", "#4e2a16");
    }
    else {
      document.body.style.backgroundColor = "#1a0e06";
      document.documentElement.style.setProperty("--scrollbar-thumb-color", "#5d6d61");
      document.documentElement.style.setProperty("--scrollbar-track-color", "#1a0e06");
    }
  }, [theme])
  return (
    <ThemeProvider theme={themeMaterial}>
      <CssBaseline />
      <PrayerProject />
    </ThemeProvider>
  );
}

export default App;
