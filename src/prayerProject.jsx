import { Box } from "@mui/material";
import { Typography } from "@mui/material";
import mosque from "./assets/mosque.png";
import PrayerCard from "./components/PrayerCard";
import Prayerheader from "./components/PrayerHeader";
import { useContext } from "react";
import ThemeContext from "./context/ThemeContext";
function PrayerProject() {
  //  state خاصه بالمظهر
  const { theme } = useContext(ThemeContext);
  return (
    <Box
      sx={{
        backgroundImage:
          theme === "dark"
            ? "linear-gradient(to top, #1c0f07, #361f12, #2b190c, #1c0f07)"
            : "linear-gradient(to bottom, #bcb59b, #FFFDF8, #bcb59b, #FFFDF8)",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: {xs:"20px",sm:"30px",md:"40px",lg:"50px"},
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        boxSizing: "border-box",
        borderTop:
          theme === "dark" ? "4px solid  #5d6d61" : "4px solid  #3a5450",
        borderBottom:
          theme === "dark" ? "4px solid  #5d6d61" : "4px solid  #3a5450",
      }}
    >
      {/* prayer header */}
      <Prayerheader />
      {/*box with image and prayer card*/}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: "20px", md: "0", lg: "100px" },
        }}
      >
        {/* image */}
        <img style={{ width: "clamp(180px, 45vw, 400px)" }} src={mosque}  />
        {/* prayer card */}
        <PrayerCard />
      </Box>
      {/* footer */}
      <Typography
        variant="subtitle1"
        sx={{
          color: theme === "dark" ? "#a47e55" : "text.secondary",
          fontWeight: "bold",
        }}
      >
        جميع الحقوق محفوظة لدى المهندس شهاب الجبري
      </Typography>
    </Box>
  );
}
export default PrayerProject;
