import { createMuiTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { shadows } from '@material-ui/system';

const defaultTheme = createMuiTheme({
    // Migration to typography v2.
    typography: {
        useNextVariants: true
    }
});

// Color Tool: https://material.io/tools/color/#!/?view.left=0&view.right=1&primary.color=e60000&secondary.color=ac2cdb&primary.text.color=ffffff
export const theme = createMuiTheme({
    // Migration to typography v2.
    typography: {
        useNextVariants: true
    },
    palette: {
        // Primary color also effects on the custom variables (see them below).
        primary: {
            main: '#e60000',
            light: '#ff5533',
            dark: '#ab0000'
        },
        secondary: {
            main: '#d6156c',
            light: '#ff5a9a',
            dark: '#9f0042'
        },
        error: {
            main: '#ffab00',
            light: '#ffdd4b',
            dark: '#c67c00'
        }
    },
    components: {
        appBar: {
            shadow: {
                boxShadow: 'none'
            },
            // Material Theming specs: https://material.io/design/components/app-bars-top.html#specs
            // TIP: Normally on the side there will be buttons with padding of 12px.
            sideMargins: {
                // <standard margin between left corner & left icon > - <icon button padding>
                padding: '0px 4px'
            },
            navigationIcon: {
                // <standard margin between left icon & app bar content> - <icon button padding>
                marginRight: 20
            }
        }
    },
    chat: {
        // Default style of every message (we don't edit the margin of the container, only inside of it (border, padding, color...).
        message: {
            text: {
                main: {
                    borderRadius: 24,
                    fontFamily: defaultTheme.typography.body1.fontFamily,
                    fontSize: defaultTheme.typography.body1.fontSize,
                    wordBreak: 'break-word'
                },
                left: {
                    padding: '10px 14px',
                    borderStyle: 'solid',
                    borderWidth: 2,
                    borderColor: fade('#e60000', 0.07)
                },
                right: {
                    // More padding than text at left, because there isn't the border here.
                    padding: '12px 16px',
                    backgroundColor: fade('#e60000', 0.07)
                }
            },
            quickReply: {
                padding: '12px 14px',
                borderRadius: 24,
                backgroundColor: fade('#e60000', 0.2),
                '&:hover': {
                    backgroundColor: fade('#e60000', 0.4)
                },
                // Font family not as Button style (from Material-UI).
                fontFamily: defaultTheme.typography.body1.fontFamily,
                fontSize: defaultTheme.typography.body1.fontSize
            },
            image: {
                borderStyle: 'solid',
                borderRadius: 24,
                borderWidth: 2,
                borderColor: fade('#e60000', 0.07)
            },
            file: {
                left: {
                    padding: '4px 6px'
                },
                right: {
                    // More padding than text at left, because there isn't the border here.
                    padding: '6px 8px'
                }
            },
            button: {
                borderRadius: 12
            }
        }
    }
});
