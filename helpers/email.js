import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
    const {email,nombre, token} = datos;

    //codigo por https://mailtrap.io/inboxes/2446368/messages
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    //Información del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en Uptask",
        html: `
            <p> Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
            <p> Tu cuenta ya casi esta lista, solo debes comprobarla en el siguiente enlace:

            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta </a>

            <p> Si tu no creaste esta cuenta, puedes ignorar el mensaje </p>

        `
    })
    
}



export const emailOlvidePassword = async (datos) => {
  const {email,nombre, token} = datos;

  //codigo por https://mailtrap.io/inboxes/2446368/messages
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //Información del email
  const info = await transport.sendMail({
      from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
      to: email,
      subject: "UpTask - Reestablece tu password",
      text: "Restablece tu password",
      html: `
          <p> Hola: ${nombre} has solicitado restablecer tu password</p>
          <p> Sigue el siguiente enlace para generar un nuevo password:

          <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Password </a>

          <p> Si tu no solicitaste el email, puedes ignorar el mensaje </p>

      `
  })
  
}