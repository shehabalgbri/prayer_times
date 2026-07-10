import { Card, Typography } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";
import { useContext, useEffect, useState, useMemo } from "react";
import ThemeContext from "../context/ThemeContext";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// داله بتحول الوقت الى الصيغه التاليه HH:MM:SS 
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hh = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  return hh * 60 + mm;
}

// داله تنسيق الفارق الزمني
function formatCountdown(totalSeconds) {
  if (totalSeconds < 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function PrayerCard() {
  // state خاصه ب المدينه
  const [selectedCity, setSelectedCity] = useState({ city: "Sana'a", country: "YE" });
  // state خاصه باوقات الصلاه
  const [prayerTimes, setPrayerTimes] = useState({});
  // state خاصه بالمنطقة الزمنية للمدينة المحددة
  const [timezone, setTimezone] = useState("Asia/Aden");
  // state خاصه بلتحميل
  const [loading, setLoading] = useState(false);
  // state خاصه بالاخطاء
  const [error, setError] = useState(null);
  // state خاصه بالمظهر
  const { theme } = useContext(ThemeContext);
  // state خاصه بالوقت الحالي (يتحدث كل ثانية)
  const [now, setNow] = useState(new Date());

  // تحديث الوقت الحالي كل ثانية
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // جلب البيانات من ال api
    fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${selectedCity.city}&country=${selectedCity.country}&method=1`,
    )
      .then((res) => {
        //  التحقق من نجاح الطلب
        if (!res.ok) throw new Error("فشل الاتصال بلخادم ");
        // تحويل الرد الى json
        return res.json();
      })
      .then((data) => {
        //  التحقق من وجود البيانات
        if (data && data.data && data.data.timings) {
          setPrayerTimes(data.data.timings);
          // جلب المنطقة الزمنية للمدينة المحددة
          if (data.data.meta && data.data.meta.timezone) {
            setTimezone(data.data.meta.timezone);
          }
        }
        //  التحقق من عدم وجود البيانات
        else {
          throw new Error("لم يتم العثور على بيانات لهذه المدينه ");
        }
      })
      // التعامل مع الاخطاء
      .catch((err) => {
        setError(err.message);
        console.error(err);
      })
      //  ايقاف التحميل
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCity]);

  //  مصفوفه باوقات الصلاة (الصلوات الخمس فقط بدون الشروق)
  const prayeritems = [
    { id: 1, name: "الفجر",   time: prayerTimes.Fajr,    icon: "🌄", key: "Fajr" },
    { id: 2, name: "الشروق",  time: prayerTimes.Sunrise,  icon: "🌅", key: "Sunrise" },
    { id: 3, name: "الظهر",   time: prayerTimes.Dhuhr,   icon: "☀️", key: "Dhuhr" },
    { id: 4, name: "العصر",   time: prayerTimes.Asr,     icon: "🕌", key: "Asr" },
    { id: 5, name: "المغرب",  time: prayerTimes.Maghrib, icon: "🌅", key: "Maghrib" },
    { id: 6, name: "العشاء",  time: prayerTimes.Isha,    icon: "🌙", key: "Isha" },
  ];

  // ========== الوقت المحلي للمدينة المحددة ==========
  const cityDate = useMemo(() => {
    try {
      const tzString = now.toLocaleString("en-US", { timeZone: timezone });
      return new Date(tzString);
    } catch (e) {
      return now;
    }
  }, [now, timezone]);

  // ========== حساب الصلاة القادمة والعداد التنازلي ==========
  const { nextPrayer, countdown } = useMemo(() => {
    // الوقت الحالي بالدقائق من منتصف الليل للمدينة المحددة
    const currentMinutes = cityDate.getHours() * 60 + cityDate.getMinutes();
    const currentSeconds = cityDate.getHours() * 3600 + cityDate.getMinutes() * 60 + cityDate.getSeconds();

    // الصلوات الخمس فقط (بدون الشروق)
    const prayersOnly = prayeritems.filter((p) => p.key !== "Sunrise");

    // ابحث عن أول صلاة وقتها لم يحن بعد
    let found = null;
    for (const prayer of prayersOnly) {
      const prayerMinutes = timeToMinutes(prayer.time);
      if (prayerMinutes === null) continue;
      if (prayerMinutes > currentMinutes) {
        found = prayer;
        // العداد التنازلي بالثواني
        const prayerSeconds = prayerMinutes * 60;
        const diff = prayerSeconds - currentSeconds;
        return { nextPrayer: prayer, countdown: formatCountdown(diff) };
      }
    }

    // إذا مرّت كل صلوات اليوم → الصلاة القادمة هي الفجر غداً
    const fajr = prayersOnly[0];
    const fajrMinutes = timeToMinutes(fajr?.time);
    if (fajrMinutes !== null) {
      const secondsUntilMidnight = (24 * 3600) - currentSeconds;
      const fajrSeconds = fajrMinutes * 60;
      const diff = secondsUntilMidnight + fajrSeconds;
      return { nextPrayer: { ...fajr, name: "الفجر (غداً)" }, countdown: formatCountdown(diff) };
    }

    return { nextPrayer: null, countdown: "00:00:00" };
  }, [cityDate, prayerTimes]);

  // مصفوفه بلمدن والدول
  const cityitem = [
    { id: "1",  name: "صنعاء",        city: "Sana'a",      country: "YE" },
    { id: "2",  name: "الرياض",       city: "Riyadh",      country: "SA" },
    { id: "3",  name: "الجزائر",      city: "Algiers",     country: "DZ" },
    { id: "4",  name: "الرباط",       city: "Rabat",       country: "MA" },
    { id: "5",  name: "القاهرة",      city: "Cairo",       country: "EG" },
    { id: "6",  name: "فلسطين",       city: "Jerusalem",   country: "PS" },
    { id: "7",  name: "سوريا",        city: "Damascus",    country: "SY" },
    { id: "8",  name: "لبنان",        city: "Beirut",      country: "LB" },
    { id: "9",  name: "الأردن",       city: "Amman",       country: "JO" },
    { id: "10", name: "العراق",       city: "Baghdad",     country: "IQ" },
    { id: "11", name: "الكويت",       city: "Kuwait City", country: "KW" },
    { id: "12", name: "قطر",          city: "Doha",        country: "QA" },
    { id: "13", name: "البحرين",      city: "Manama",      country: "BH" },
    { id: "14", name: "الإمارات",     city: "Abu Dhabi",   country: "AE" },
    { id: "15", name: "عمان",         city: "Muscat",      country: "OM" },
    { id: "16", name: "تونس",         city: "Tunis",       country: "TN" },
    { id: "17", name: "ليبيا",        city: "Tripoli",     country: "LY" },
    { id: "18", name: "السودان",      city: "Khartoum",    country: "SD" },
    { id: "19", name: "الصومال",      city: "Mogadishu",   country: "SO" },
    { id: "20", name: "جيبوتي",       city: "Djibouti",    country: "DJ" },
    { id: "21", name: "موريتانيا",    city: "Nouakchott",  country: "MR" },
    { id: "22", name: "جزر القمر",    city: "Moroni",      country: "KM" },
    { id: "23", name: "جزر المالديف", city: "Male",        country: "MV" },
  ];

  // الاسم العربي للمدينة المحددة
  const cityNameArabic = useMemo(() => {
    const found = cityitem.find((c) => c.city === selectedCity.city);
    return found ? found.name : selectedCity.city;
  }, [selectedCity, cityitem]);

  // maping خاصه باوقات الصلاه
  const prayerArray = prayeritems.map((item) => {
    const isNext = nextPrayer && item.key === nextPrayer.key;
    return (
      <TableRow
        key={item.id}
        sx={{
          backgroundColor: isNext
            ? theme === "dark"
              ? "rgba(164, 126, 85, 0.25)"
              : "rgba(58, 84, 80, 0.12)"
            : "transparent",
          transition: "background-color 0.4s ease",
          borderRadius: isNext ? "12px" : "0",
        }}
      >
        <TableCell
          sx={{
            color: theme === "dark" ? "text.primary" : "text.secondary",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: "10px",
            borderBottom: isNext
              ? theme === "dark"
                ? "2px solid #a47e55"
                : "2px solid #3a5450"
              : undefined,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: isNext
                ? theme === "dark"
                  ? "#f4c87a"
                  : "#3a5450"
                : item.name === "الشروق" && theme === "dark"
                ? "#ada897ff"
                : "",
              fontWeight: isNext ? "bold" : "normal",
            }}
          >
            {item.name}
            {item.icon}
            {/* مؤشر "القادمة" */}
            {isNext && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  fontSize: "12px",
                  backgroundColor: theme === "dark" ? "#a47e55" : "#3a5450",
                  color: "#f2e8cb",
                  borderRadius: "8px",
                  px: "6px",
                  py: "2px",
                  verticalAlign: "middle",
                }}
              >
                القادمة
              </Box>
            )}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: isNext
                ? theme === "dark"
                  ? "#f4c87a"
                  : "#3a5450"
                : "",
              fontWeight: isNext ? "bold" : "normal",
            }}
          >
            {item.time}
          </Typography>
        </TableCell>
      </TableRow>
    );
  });

  // maping خاصه بلمدن
  const cityArray = cityitem.map((item) => (
    <MenuItem key={item.id} value={item.city}>
      {item.name}
    </MenuItem>
  ));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      {/* menu بلمدن */}
      <FormControl
        fullWidth
        sx={{
          width: { xs: "90%", md: "100%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <InputLabel
          id="demo-simple-select-label"
          sx={{
            color: theme === "dark" ? "#f2e8cb" : "#4e2a16",
            fontWeight: "bold",
          }}
        >
          اختر المدينة
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedCity.city}
          label="اختر المدينة"
          onChange={(e) => {
            const found = cityitem.find((c) => c.city === e.target.value);
            if (found) setSelectedCity({ city: found.city, country: found.country });
          }}
          sx={{
            color: "#f2e8cb",
            fontWeight: "bold",
            minWidth: { xs: "70%", md: "100%" },
            height: "100%",
            borderRadius: "20px",
            margin: "10px",
            backgroundColor: "#5d6d61",
            transition: "all 0.3s ease",
            "& .MuiSvgIcon-root": {
              color: "#f2e8cb",
            },
            "&:hover": {
              backgroundColor: theme === "dark" ? "#738377ff" : "#6b796fff",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: theme === "dark" ? "#1a0e06" : "#FFFDF8",
                color: theme === "dark" ? "#f2e8cb" : "#4e2a16",
                border: theme === "dark" ? "1px solid #5d6d61" : "1px solid #b39064",
                borderRadius: "12px",
                marginTop: "4px",
                "& .MuiMenuItem-root": {
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: theme === "dark" ? "#a47e55" : "text.secondary",
                    color: theme === "dark" ? "#4e2a16" : "#f2e8cb",
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme === "dark" ? "#a47e55" : "text.secondary",
                    color: theme === "dark" ? "#4e2a16" : "#f2e8cb",
                  },
                },
              },
            },
          }}
        >
          {cityArray}
        </Select>
      </FormControl>

      {/* spinner */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <CircularProgress sx={{ color: "#a47e55" }} />
        </Box>
      )}

      {/* رساله الخطاء */}
      {!loading && error && (
        <Alert
          severity="error"
          sx={{
            backgroundColor: theme === "dark" ? "#2a1010" : "#fff0f0",
            color: theme === "dark" ? "#f2e8cb" : "#4e2a16",
            border: "1px solid #8b0000",
            borderRadius: "12px",
            width: "100%",
          }}
        >
          ⚠️ {error}
        </Alert>
      )}

      {/* بطاقة الصلاة القادمة */}
      {!loading && !error && nextPrayer && (
        <Box
          sx={{
            width: { xs: "90%", md: "100%" },
            borderRadius: "16px",
            padding: "16px 24px",
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #3d2504, #5d6d61)"
                : "linear-gradient(135deg, #3a5450, #806238ff)",
            boxShadow:
              theme === "dark"
                ? "0 4px 20px rgba(164,126,85,0.35)"
                : "0 4px 20px rgba(58,84,80,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            animation: "pulse-glow 2.5s ease-in-out infinite",
            "@keyframes pulse-glow": {
              "0%, 100%": {
                boxShadow:
                  theme === "dark"
                    ? "0 4px 20px rgba(164,126,85,0.35)"
                    : "0 4px 20px rgba(58,84,80,0.35)",
              },
              "50%": {
                boxShadow:
                  theme === "dark"
                    ? "0 6px 30px rgba(164,126,85,0.6)"
                    : "0 6px 30px rgba(58,84,80,0.55)",
              },
            },
          }}
        >
          {/* عنوان البطاقة */}
          <Typography
            variant="body2"
            sx={{ color: "rgba(242,232,203,0.75)", letterSpacing: "1px", fontWeight: "bold" }}
          >
            ⏳ الصلاة القادمة
          </Typography>

          {/* اسم الصلاة ووقتها */}
          <Typography
            variant="h5"
            sx={{ color: "#f2e8cb", fontWeight: "bold" }}
          >
            {nextPrayer.icon} {nextPrayer.name} (في تمام الساعة {nextPrayer.time})
          </Typography>

          {/* الوقت الحالي للمدينة */}
          <Typography
            variant="body2"
            sx={{ color: "rgba(242,232,203,0.8)", mt: 0.5 }}
          >
            الوقت الآن في {cityNameArabic}: {cityDate.toLocaleTimeString("ar-YE", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </Typography>

          {/* العداد التنازلي مع توضيح صريح */}
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(242,232,203,0.7)", fontWeight: "bold" }}
            >
              الوقت المتبقي للأذان:
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "#f4c87a",
                fontWeight: "bold",
                fontFamily: "monospace",
                letterSpacing: "4px",
                mt: "2px",
                direction: "ltr",
              }}
            >
              {countdown}
            </Typography>
          </Box>
        </Box>
      )}

      {/* الجدول  */}
      {!loading && !error && (
        <Card variant="outlined">
          <TableContainer
            component={Paper}
            sx={{ backgroundColor: theme === "dark" ? "#1a0e06" : "#FFFDF8" }}
          >
            <Table sx={{ minWidth: { xs:"100%", md: 450 } }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    colSpan={2}
                    sx={{
                      backgroundImage:
                        theme === "dark"
                          ? "linear-gradient(to right, #8e6d19, #c4a273)"
                          : "linear-gradient(to right, #3d2d04ff, #806238ff)",
                      color: "text.primary",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme === "dark" ? "#f2e8cb" : "#f2e8cb",
                        fontWeight: "bold",
                      }}
                    >
                      اوقات الصلاه اليوم
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{prayerArray}</TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
export default PrayerCard;
