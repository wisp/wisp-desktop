import { createTheme } from '@mui/material/styles';

/*
$gray1: #262E39;
$gray2: #39404D;
$gray3: #565D69;
$gray4: #6d7481;
$gray5: #8A8F9D;
$gray6: #ACB0BA;
$gray7: #CBCFD8;
$gray8: #DFE2E8;
$gray9: #EAECF0;
$gray10: #F9FAFB;

$red1: #fad2d2;
$red2: #e93838;
$red3: #5c0404;
$red4: #db4d46;

$green1: #d6f5d6;
$green2: #24c94d;
$green3: #044104;
$green4: #65a965;

$blue1: #d6dff5;
$blue2: #0a4d8a;
$blue3: #06294a;
$blue4: #2f6aa1;

$yellow1: #fafad2;
$yellow2: #f1dd26;
$yellow3: #af8000;
$yellow4: #f9d165;
*/

export const theme = createTheme({
    status: {
        danger: '#e53e3e',
    },
    palette: {
        primary: {
            main: '#0675cf',
            darker: '#0069b3',
            light: '#d6dff5',
        },
        blue: {
            blue1: '#d6dff5',
            blue2: '#0a4d8a',
            blue3: '#06294a',
            blue4: '#2f6aa1',
        },
        gray: {
            gray1: '#262E39',
            gray2: '#39404D',
            gray3: '#565D69',
            gray4: '#6d7481',
            gray5: '#8A8F9D',
            gray6: '#ACB0BA',
            gray7: '#CBCFD8',
            gray8: '#DFE2E8',
            gray9: '#EAECF0',
            gray10: '#F9FAFB',
        },
        red: {
            red1: '#fad2d2',
            red2: '#e93838',
            red3: '#5c0404',
            red4: '#db4d46',
        },
        green: {
            green1: '#d6f5d6',
            green2: '#24c94d',
            green3: '#044104',
            green4: '#65a965',
        },
        yellow: {
            yellow1: '#fafad2',
            yellow2: '#f1dd26',
            yellow3: '#af8000',
            yellow4: '#f9d165',
        }
    },
    props: {
        // Name of the component
        MuiButtonBase: {
            // The properties to apply
            disableRipple: true // No more ripple, on the whole application!
        }
    },
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        }
    },
    typography: {
        fontFamily: [
          '"IBM Plex Sans"',
        ].join(','),
      },
});