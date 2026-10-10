function createUser(){

    const users =
        JSON.parse(
            localStorage.getItem("users")
        ) || [];

    const username =
        prompt("Username");

    const password =
        prompt("Password");

    users.push({
        username,
        password
    });

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    alert("User Created");

}
