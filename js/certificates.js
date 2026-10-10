function generateCertificate(){

    const certificate = {

        certificateId:
            "ST-" +
            Date.now(),

        username:
            localStorage.getItem(
                "username"
            ),

        course:
            "Safeguarding",

        score:
            "92%",

        date:
            new Date()
                .toLocaleDateString()

    };

    localStorage.setItem(
        "certificate",
        JSON.stringify(certificate)
    );

    alert(
        "Certificate Generated"
    );

}
