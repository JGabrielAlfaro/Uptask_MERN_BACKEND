
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
//next nos permite ir al siguiente Middleware (router.get('/perfil',checkAuth,perfil)), pasamos de checkout a perfil
const checkAuth = async (req,res,next) => {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // console.log(decoded)
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v") // para que no exponga el campo password.

            // console.log(req.usuario)
            return next()
        } catch (error) {
            return res.status(404).json({msg:"Hubo un error al decodificar el token"})
        }
    }
    if (!token){
        const error = new Error ('Token no valido.!!!')
        return res.status(401).json({msg:error.message})
    }
    next(); // el siguiente es perfil
}

export default checkAuth;