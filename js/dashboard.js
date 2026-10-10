window.onload = () => {

    const user =
        JSON.parse(
            localStorage.getItem(
                "loggedInUser"
            )
        );

    if(user){

        const welcome =
            document.getElementById(
                "welcome"
            );

        if(welcome){

            welcome.innerText =
                "Welcome back, " +
                user.username;

        }

    }

};
