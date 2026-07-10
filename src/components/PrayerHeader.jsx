import { Box, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { FaStar } from "react-icons/fa6";
import { useEffect, useState, useContext } from "react";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ThemeContext from "../context/ThemeContext";
function Prayerheader() {
  //  state خاصه باالوقت والتاريخ 
  const [date, setDate] = useState("");
  //  state خاصه بالمظهر
  const { theme, toggleTheme } = useContext(ThemeContext);
  useEffect(() => {
    const updateDate = () => {
      const tody = new Date();
      const formatedDate = tody.toLocaleDateString("ar-YE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setDate(formatedDate);
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Box sx={{ flexGrow: 1, width: "100%", boxShadow: "none" }}>
      <AppBar
        position="static"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <WbSunnyIcon sx={{ color: "text.secondary" }} />
            ) : (
              <DarkModeIcon sx={{ color: "text.primary" }} />
            )}
          </IconButton>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: theme === "dark" ? "#a47e55" : "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <FaStar />
              بسم الله الرحمن الرحيم
              <FaStar />
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: theme === "dark" ? "text.primary" : "text.secondary",
                fontSize:{xs:"1.8rem",sm:"2.5rem",md:"3rem"}
              }}
            >
              مواقيت الصلاة
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme === "dark" ? "#a47e55" : "text.secondary",
              }}
            >
              {date}
            </Typography>
          </Box>
          <Box></Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default Prayerheader;
