
import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import {emailRegistro,emailOlvidePassword} from '../helpers/email.js'

const registrar = async (req,res) => {

   //Evitar registros duplicados.
   const {email} = req.body;
   const existeUsuario = await Usuario.findOne({email})
   
   if (existeUsuario){
    const error = new Error ("Usuario ya registrado")
    return res.status(400).json({msg:error.message})
   }

   try {
    const usuario = new Usuario(req.body)
    // console.log(usuario)
    usuario.token = generarId();
    // const usuarioAlmacenado = await usuario.save(); // Guardamos en base de datos.
    await usuario.save();

    //Enviar el email de confirmación
    emailRegistro({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })
    
    res.json({msg:'Usuario creado correctamente. Revisa tu email para confirmar tu cuenta'})
   } catch (error) {
        console.log(error)
   }

}

const autenticar = async (req,res) =>{

    const {email,password} = req.body;

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne ({email}) // esto es como un where

    // console.log(usuario) si no existe sale null
    if (!usuario){
        const error = new Error ("El usuario no existe.!!!")
        return res.status(404).json({msg:error.message})
    }

    //Comprobar si el usuario esta confirmado
    if (!usuario.confirmado){
        const error = new Error ("Esta cuenta no ha sido confirmada.!!!")
        return res.status(403).json({msg:error.message})
    }


    //Comprobar el password
    if (await usuario.comprobarPassword(password)){
        res.json({
            _id:usuario._id,
            nombre: usuario.nombre,
            email:usuario.email,
            token: generarJWT(usuario._id)
        })
    }else {
        const error = new Error ("El password es Incorrecto.!!!")
        return res.status(403).json({msg:error.message})
    }

}

const confirmar = async (req,res) => {
    // console.log(req.params.token)
    const {token} = req.params;
    const usuarioConfirmar = await Usuario.findOne({token})
    // console.log(usuarioConfirmar) //sino tienen nada, devuele null, sino los datos del usuario 

    if (!usuarioConfirmar){
        const error = new Error ("El token no es valido.!!!")
        return res.status(403).json({msg:error.message})
    }

    try {
       
       usuarioConfirmar.confirmado=true;
       usuarioConfirmar.token ="";
       await usuarioConfirmar.save(); // Almacenamos en la base de datos.
       res.json({msg:"Usuario confirmado correctamente.!!!"})

    //    console.log(usuarioConfirmar) ;
    } catch (error) {
        console.log(error)
    }

}

const olvidePassword = async (req,res) => {
    const {email} = req.body;
    const usuario = await Usuario.findOne ({email})
    if (!usuario){
        const error = new Error ("El usuario no existe.!!!")
        return res.status(404).json({msg:error.message})
    }


    try {
        usuario.token = generarId()
        await usuario.save();
         //Enviar el email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg:"Hemos enviando un email con las instrucciones.!!!"})
    } catch (error) {
        console.log(error)
    }

}


const comprobarToken = async (req,res) => {
    const {token} = req.params;
    const tokenValido = await Usuario.findOne({token})
    if (tokenValido){
       res.json({msg:"Token valido y el usuario existe"})
    }else {
        const error = new Error("Token no valido para la recuperacion del password.!!!")
        return res.status(404).json({msg:error.message})
    }
}

const nuevoPassword = async (req,res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token})
    if (usuario){
        usuario.password = password;
        usuario.token =""
        try {
            await usuario.save();
            res.json({msg:"Password modificado correctamente"})
        } catch (error) {
            console.log(error)
        }
    }else {
        const error = new Error("Token no valido para la recuperacion del password.!!!")
        return res.status(404).json({msg:error.message})
    }
}

const perfil = async (req,res) => {
    // console.log("Desde perfil")
    const {usuario} = req;
    res.json(usuario)// leemos desde el servidor
}
export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}