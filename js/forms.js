function updateProgress(){

    const total =
        document.querySelectorAll(
            ".question"
        ).length;

    const completed =
        document.querySelectorAll(
            "input:checked"
        ).length;

    const progress =
        document.getElementById(
            "progress"
        );

    if(progress){

        progress.textContent =
        `${completed}/${total}`;

    }

}

document.addEventListener(
    "change",
    updateProgress
);

updateProgress();
