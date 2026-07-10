import { useState } from "react";
import ThemeContext from "./ThemeContext";
export function ThemeProvider({children}){
    const [theme,setTheme] = useState(
        localStorage.getItem("theme") || "dark"
    );
    const toggleTheme = () => {
       const newTheme = theme === "dark" ? "light" : "dark";
       setTheme(newTheme);
       localStorage.setItem("theme",newTheme);
    };
    return(
        <ThemeContext.Provider value={{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}
