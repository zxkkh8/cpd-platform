/*
=========================================
BRAMPTON DEVELOP CONFIGURATION
=========================================
EDIT THIS FILE ONLY
=========================================
*/

const APP = {

    /* Branding */

    companyName: "Brampton Develop",

    portalName:
        "Development & Training Portal",

    logoPath:
        "assets/logo.svg",

    backgroundImage:
        "assets/background.jpg",

    favicon:
        "assets/favicon.ico",



    /* Links */

    forgotPasswordUrl:
        "#",

    supportUrl:
        "#",

    privacyPolicyUrl:
        "#",

    termsUrl:
        "#",



    /* Supabase */

    supabase: {

        url:
            "YOUR_SUPABASE_URL",

        key:
            "YOUR_SUPABASE_PUBLISHABLE_KEY"

    },



    /* Pages */

    loginPage:
        "index.html",

    dashboardPage:
        "dashboard.html",

    logoutPage:
        "index.html",



    /* Forms */

    defaultPassMark:
        80,

    defaultCPDHours:
        1,



    /* Certificates */

    certificatePrefix:
        "BD",



    /* Theme */

    theme: {

        primary:
            "#0078D4",

        secondary:
            "#24315B",

        success:
            "#107C10",

        warning:
            "#FFB900",

        danger:
            "#D83B01"

    }

};
