if (typeof APP === "undefined") {
    throw new Error("config.js must be loaded before supabase.js");
}

if (!window.supabase) {
    throw new Error("Supabase JS library has not loaded.");
}

if (!APP.supabase?.url || !APP.supabase?.key) {
    throw new Error("Supabase URL or public anon key is missing.");
}

window.supabaseClient = window.supabase.createClient(
    APP.supabase.url,
    APP.supabase.key,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

const supabaseClient = window.supabaseClient;
async function loginUser(username, password) {
    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: username,
                password: password
            });

        if (error || !data?.user) {
            return {
                success: false,
                message: "Invalid username or password."
            };
        }

        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("id, username, display_name, role")
                .eq("id", data.user.id)
                .single();

        if (profileError || !profile) {
            await supabaseClient.auth.signOut();

            return {
                success: false,
                message: "Your account profile could not be loaded."
            };
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(profile)
        );

        return {
            success: true,
            user: profile
        };

    } catch (error) {
        console.error("Login error:", error);

        return {
            success: false,
            message: "Unable to sign in. Please try again."
        };
    }
}

async function getCurrentSession() {
    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session;
}

function getCurrentUser() {
    try {
        const user = localStorage.getItem("currentUser");
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

async function logoutUser() {
    localStorage.removeItem("currentUser");

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
    }

    window.location.href = APP.logoutPage || "login.html";
}

async function getUsers() {
    const { data, error } =
        await supabaseClient
            .from("users")
            .select("*")
            .order("username");

    if (error) {
        console.error("Get users error:", error);
        return [];
    }

    return data || [];
}

async function createUser(user) {
    const { data, error } =
        await supabaseClient
            .from("users")
            .insert([user])
            .select();

    if (error) throw error;

    return data;
}

async function updateUser(id, updates) {
    const { data, error } =
        await supabaseClient
            .from("users")
            .update(updates)
            .eq("id", id)
            .select();

    if (error) throw error;

    return data;
}

async function getForms() {
    const { data, error } =
        await supabaseClient
            .from("forms")
            .select("*")
            .order("id", {
                ascending: false
            });

    if (error) {
        console.error("Get forms error:", error);
        return [];
    }

    return data || [];
}

async function createForm(formData) {
    const { data, error } =
        await supabaseClient
            .from("forms")
            .insert([formData])
            .select();

    if (error) throw error;

    return data;
}

async function getResponses() {
    const { data, error } =
        await supabaseClient
            .from("responses")
            .select("*")
            .order("submitted_at", {
                ascending: false
            });

    if (error) {
        console.error("Get responses error:", error);
        return [];
    }

    return data || [];
}

async function saveResponse(response) {
    const { data, error } =
        await supabaseClient
            .from("responses")
            .insert([response])
            .select();

    if (error) throw error;

    return data;
}

async function getCertificates() {
    const { data, error } =
        await supabaseClient
            .from("certificates")
            .select("*")
            .order("issue_date", {
                ascending: false
            });

    if (error) {
        console.error("Get certificates error:", error);
        return [];
    }

    return data || [];
}

async function createCertificate(
    username,
    course,
    score
) {
    const certificateId =
        APP.certificatePrefix + "-" + Date.now();

    const { data, error } =
        await supabaseClient
            .from("certificates")
            .insert([{
                certificate_id: certificateId,
                username: username,
                course: course,
                score: score,
                issue_date: new Date().toISOString()
            }])
            .select();

    if (error) throw error;

    return data;
}

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
        users: users.length,
        forms: forms.length,
        responses: responses.length,
        certificates: certificates.length
    };
}
