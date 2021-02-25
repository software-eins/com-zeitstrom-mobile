const branding = process.env.VUE_APP_BRANDING as unknown as string;

const brands = new Map < string, any>();

brands.set("orange", {
    id: "orange",
    name: "TA Zeitblick",
    url: "ta-zeitblick.de",
    colors: {
        primary: '#FF8200',
        success: '#28C76F',
        danger: '#EA5455',
        warning: '#FF9F43',
        dark: '#1E1E1E',
    },
    isMobile: process.env.VUE_APP_IS_MOBILE == 'true',
    supportPhone: '+49 1806 456326',
    supportPhoneFootnote: 'Mo-Do 7 – 17 Uhr, Fr 7 - 16 Uhr, 20 Cent aus dem deutschen Festnetz, Mobilfunkpreise können abweichen, maximal jedoch 60 Cent pro Anruf',
});

brands.set("red", {
    id: "red",
    name: "Zeitstrom",
    url: "app.zeitstrom.com",
    colors: {
        primary: '#DF4D44',
        success: '#28C76F',
        danger: '#EA5455',
        warning: '#FF9F43',
        dark: '#1E1E1E',
    },
    isMobile: process.env.VUE_APP_IS_MOBILE == 'true',
    supportPhone: undefined,
    supportPhoneFootnote: undefined,
});


export default brands.get(branding || 'orange');
