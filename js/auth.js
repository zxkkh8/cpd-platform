const users = [
    {
        username: "admin",
        password: "admin123",
        role: "Super Admin"
    },
    {
        username: "trainer",
        password: "trainer123",
        role: "Trainer"
    }
];

function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const user = users.find(u =>
        u.username === username &&
        u.password === password
    );

    if(user){

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        window.location.href =
            "dashboard.html";

    }else{

        alert("Invalid username or password");

    }

}
