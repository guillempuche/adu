/**
 * All about themes https://material-ui.com/customization/themes/
 * Color palette: https://material-ui.com/style/color/
 *
 * How to do it? https://blog.bam.tech/developper-news/get-the-best-of-your-react-app-design-by-using-material-ui-theme
 *
 * The theme exposes the following color intentions:
 *  - primary - used to represent primary interface elements for a user.
 *  - secondary - used to represent secondary interface elements for a user.
 *  - error - used to represent interface elements that the user should be made aware of.
 *
 */
import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

const theme = createMuiTheme({
    palette: {
        primary: {
            light: red, // "#757ce8",
            main: "#3f50b5",
            // dark: "#002884",
            // dark: will be calculated from palette.primary.main,
            contrastText: "#fff"
        },
        secondary: {
            light: "#ff7961",
            main: "#f44336",
            dark: "#ba000d",
            contrastText: "#000"
        }
        // error: {
        //     light: palette.error[300],
        //     main: palette.error[500],
        //     dark: palette.error[700],
        //     contrastText: getContrastText(palette.error[500])
        // }
    },
    typography: {
        fontSize: 12
    }
});

export default theme;
