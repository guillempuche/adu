import { createMuiTheme } from '@material-ui/core/styles';

// Color Tool: https://material.io/tools/color/#!/?view.left=0&view.right=1&primary.color=e60000&secondary.color=ac2cdb&primary.text.color=ffffff
export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#e60000',
            light: '#ff5533',
            dark: '#ab0000'
        },
        secondary: {
            main: '#d6156c',
            light: '#ff5a9a',
            dark: '#9f0042'
        }
    },
    // Migration to typography v2.
    typography: {
        useNextVariants: true
    }
});
