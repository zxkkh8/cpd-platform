const SUPABASE_URL = "https://vllatlqfhnnjqoglzwpo.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_CQjRAmwDaw8AQzfTz1azuw_1HdcGxwp";
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function signIn(username, password) {

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

    if (error || !data) {

        alert("Invalid username or password");

        return false;

    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify(data)
    );

    window.location.href =
        "dashboard.html";

}

function logout() {

    localStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "index.html";

}

function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem(
            "currentUser"
        )
    );

}

async function createUser(
    username,
    password,
    role
) {

    const { error } =
    await supabaseClient
    .from("users")
    .insert([{
        username,
        password,
        role,
        active: true
    }]);

    if(error){

        alert(error.message);

        return;

    }

    alert("User Created");

}

async function getUsers(){

    const { data, error } =
    await supabaseClient
    .from("users")
    .select("*");

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

async function createForm(formData){

    const { error } =
    await supabaseClient
    .from("forms")
    .insert([formData]);

    if(error){

        console.error(error);

        return false;

    }

    return true;

}

async function getForms(){

    const { data, error } =
    await supabaseClient
    .from("forms")
    .select("*");

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

async function saveResponse(response){

    const { error } =
    await supabaseClient
    .from("responses")
    .insert([response]);

    if(error){

        console.error(error);

    }

}

async function getResponses(formId){

    const { data, error } =
    await supabaseClient
    .from("responses")
    .select("*")
    .eq("form_id", formId);

    if(error){

        console.error(error);

        return [];

    }

    return data;

}

async function createCertificate(
    username,
    course,
    score
){

    const certificateId =
        "ST-" + Date.now();

    const { error } =
        await supabaseClient
        .from("certificates")
        .insert([{

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

        }]);

    if(error){

        console.error(error);

    }

}

async function getCertificates(){

    const { data, error } =
    await supabaseClient
    .from("certificates")
    .select("*");

    if(error){

        console.error(error);

        return [];

    }

    return data;

}
