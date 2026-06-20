const emailTemplate = (newPassword) => {
    return `
        <!DOCTYPE html>
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    .container {
                        width: 100%;
                        height: 100vh;
                        min-height: 500px;
                        display: flex;
                        font-family: "Inter", sans-serif;
                        background: #b3daff;
                    }
                    .center {
                        background: #ffffff;
                        width: 100%;
                        max-width: 600px;
                        height: 100%;
                        margin: auto;
                        display: flex;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.048);
                    }
                    .content {
                        width: 100%;
                        margin: auto 5%;
                    }
                    .title {
                        font-size: 30px;
                        text-align: center;
                        margin: 20px;
                    }
                    .divider-line {
                        width: 70%;
                        height: 0.3rem;
                        background: #1A66AC;
                        margin: 0 auto;
                    }
                    .text {
                        display: block;
                        width: 100%;
                        max-width: 420px;
                        font-size: 13px;
                        text-align: center;
                        margin: 20px auto;
                    }
                    .new-password {
                        display: block;
                        margin: 0 auto;
                        width: 300px;
                        border: none;
                        padding: 15px 0;
                        background: #1A66AC;
                        color: #ffffff !important;
                        font-size: 20px;
                        border-radius: 0 30px 0 30px;
                        cursor: pointer;
                        text-align: center;
                        text-decoration: none;
                    }
                    .btn-rest:active {
                        background: #46729b;
                    }
                    @media(min-width: 600px) {
                        .title {
                            font-size: 40px;
                            margin: 40px;
                        }
                        .text {
                            font-size: 15px;
                            max-width: 450px;
                            margin: 40px auto;
                        }
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class="center">
                        <div class="content">
                            <h1 class="title">App Bitacoras</h1>
                            <div class="divider-line"></div>
                            <p class="text">
                                Has solicitado un restablecimiento de contraseña en tu cuenta de Bitacoras, 
                                tu nueva contraseña es la siguiente:
                            </p>
                            <p class="new-password">
                                ${newPassword}
                            </p>
                            <p class="text">
                                Si solicitaste por error el restablecimiento de contraseña de tu cuenta, haz caso omiso a este mensaje.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
}
module.exports = {
    emailTemplate
};