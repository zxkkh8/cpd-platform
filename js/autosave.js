document.addEventListener(
    "change",
    (event) => {

        if(
            event.target.matches(
                "input, textarea, select"
            )
        ){

            localStorage.setItem(
                event.target.name,
                event.target.value
            );

        }

    }
);
