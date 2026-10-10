/*
=========================================
BRAMPTON DEVELOP
SUPABASE INITIALISATION
=========================================
Requires:
- js/config.js
- Supabase CDN
=========================================
*/

if (typeof APP === "undefined") {
    throw new Error(
        "config.js must be loaded before supabase.js"
    );
}

const supabaseClient = supabase.createClient(
    APP.supabase.url,
    APP.supabase.key
);

/*
=========================================
AUTHENTICATION
=========================================
*/

async function loginUser(username, password) {

    const { data, error } =
        await supabaseClient
            .from("users")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .single();

    if (error || !data) {
        return {
            success: false,
            message: "Invalid username or password"
        };
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify(data)
    );

    return {
        success: true,
        user: data
    };
}

function getCurrentUser() {

    const user =
        localStorage.getItem("currentUser");

    return user
        ? JSON.parse(user)
        : null;
}

function logoutUser() {

    localStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        APP.logoutPage;
}

/*
=========================================
USERS
=========================================
*/

async function getUsers() {

    const { data, error } =
        await supabaseClient
            .from("users")
            .select("*")
            .order("username");

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

async function createUser(user) {

    const { data, error } =
        await supabaseClient
            .from("users")
            .insert([user])
            .select();

    if (error) {
        throw error;
    }

    return data;
}

async function updateUser(id, updates) {

    const { data, error } =
        await supabaseClient
            .from("users")
            .update(updates)
            .eq("id", id)
            .select();

    if (error) {
        throw error;
    }

    return data;
}

/*
=========================================
FORMS
=========================================
*/

async function getForms() {

    const { data, error } =
        await supabaseClient
            .from("forms")
            .select("*")
            .order("id", {
                ascending: false
            });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

async function createForm(formData) {

    const { data, error } =
        await supabaseClient
            .from("forms")
            .insert([formData])
            .select();

    if (error) {
        throw error;
    }

    return data;
}

/*
=========================================
RESPONSES
=========================================
*/

async function getResponses() {

    const { data, error } =
        await supabaseClient
            .from("responses")
            .select("*")
            .order("submitted_at", {
                ascending: false
            });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

async function saveResponse(response) {

    const { data, error } =
        await supabaseClient
            .from("responses")
            .insert([response])
            .select();

    if (error) {
        throw error;
    }

    return data;
}

/*
=========================================
CERTIFICATES
=========================================
*/

async function getCertificates() {

    const { data, error } =
        await supabaseClient
            .from("certificates")
            .select("*")
            .order("issue_date", {
                ascending: false
            });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

async function createCertificate(
    username,
    course,
    score
) {

    const certificateId =
        APP.certificatePrefix +
        "-" +
        Date.now();

    const { data, error } =
        await supabaseClient
            .from("certificates")
            .insert([
                {
                    certificate_id:
                        certificateId,

                    username:
                        username,

                    course:
                        course,

                    score:
                        score,

                    issue_date:
                        new Date()
                        .toISOString()
                }
            ])
            .select();

    if (error) {
        throw error;
    }

    return data;
}

/*
=========================================
DASHBOARD STATS
=========================================
*/

async function getDashboardStats() {

    const [
        users,
        forms,
        responses,
        certificates
    ] = await Promise.all([

        getUsers(),
        getForms(),
        getResponses(),
        getCertificates()

    ]);

    return {

        users:
            users.length,

        forms:
            forms.length,

        responses:
            responses.length,

        certificates:
            certificates.length

    };

}
