
import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tarea.js';
import Usuario from '../models/Usuario.js';

const obtenerProyectos = async ( req,res ) => {
    const proyectos = await Proyecto.find({
      '$or': [
        {'colaboradores': {$in: req.usuario }}, 
        {'creador': {$in: req.usuario }}, 
      ] 
    }).select('-tareas');

    // .where('creador')
    // .equals(req.usuario)
    // .select('-tareas');
    res.json(proyectos)

}

const nuevoProyecto = async ( req,res ) => {

    // console.log(req.body)
    // console.log(req.usuario)
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
        // console.log(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
};

const obtenerProyecto = async ( req,res ) => {
    const {id}= req.params;
    // const proyecto = await Proyecto.findById(id)
    // .populate('tareas')
    // .populate('colaboradores', "nombre email")

    const proyecto = await Proyecto.findById(id)
    .populate({
        path:'tareas', 
        populate: {path:'completado', select : "nombre" },
    })
    .populate('colaboradores', "nombre email")

    if (!proyecto){
        const error = new Error("Proyecto No encontrado")
        return res.status(404).json({msg:error.message})
    }
    //Ser administrador o colaborador
    if (proyecto.creador.toString()!== req.usuario._id.toString()  && !proyecto.colaboradores.some(c => c._id.toString() === req.usuario._id.toString()) ){
        const error = new Error("Acción no válida")
        return res.status(401).json({msg:error.message})
    }

    res.json(proyecto)
};

const editarProyecto = async ( req,res ) => {

    const {id}= req.params;
    const proyecto = await Proyecto.findById(id)
    if (!proyecto){
        const error = new Error("No encontrado")
        return res.status(404).json({msg:error.message})
    }
    if (proyecto.creador.toString()!== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(401).json({msg:error.message})
    }
    
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
    
    
};

const eliminarProyecto = async ( req,res ) => {

    const {id}= req.params;
    const proyecto = await Proyecto.findById(id)
    if (!proyecto){
        const error = new Error("No encontrado")
        return res.status(404).json({msg:error.message})
    }
    if (proyecto.creador.toString()!== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(401).json({msg:error.message})
    }
    
    try {
       await proyecto.deleteOne()
        res.json({msg:"Proyecto Eliminado"})
    } catch (error) {
        console.log(error)
    }
    
};

const buscarColaborador = async ( req,res ) => {
    const {email} = req.body
    //Para buscar por el email en el esquema de Usuarios, y todo lo que no requerimos que traiga.
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if (!usuario){
        const error = new Error ('Usuario no encontrado')
        return res.status(404).json({msg:error.message})
    }
    res.json(usuario);
};
const agregarColaborador = async ( req,res ) => {
    // console.log(req.params.id)
    const proyecto = await Proyecto.findById (req.params.id);
    if (!proyecto){
        const error = new Error('Proyecto No encontrado')
        res.status(404).json({msg: error.message})
    }

    //Validar que nadie cree colaborades en proyectos ajenos.
    if (proyecto.creador.toString() !==req.usuario._id.toString()){
        const error =new ("Acción no valida")
        return res.status(404).json({msg: error.message})
    }
    

    const {email} = req.body
    //Para buscar por el email en el esquema de Usuarios, y todo lo que no requerimos que traiga.
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if (!usuario){
        const error = new Error ('Usuario no encontrado')
        return res.status(404).json({msg:error.message})
    }

    //El colaborador no es el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error ('El creador del proyecto no puede ser colaborador')
        return res.status(404).json({msg:error.message})
    }

    //Revisar que no este agregado al proyecto.
    if (proyecto.colaboradores.includes(usuario._id) ){
        const error = new Error ('El usuario ya pertecene al proyecto')
        return res.status(404).json({msg:error.message})
    }

    // Esta bien, se puede agregar
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg:"Colaborador agregado correctamente"})
};

const eliminarColaborador = async ( req,res ) => {
     // console.log(req.params.id)
     const proyecto = await Proyecto.findById (req.params.id);
     if (!proyecto){
         const error = new Error('Proyecto No encontrado')
         res.status(404).json({msg: error.message})
     }
 
     //Validar que nadie cree colaborades en proyectos ajenos.
     if (proyecto.creador.toString() !==req.usuario._id.toString()){
         const error =new ("Acción no valida")
         return res.status(404).json({msg: error.message})
     }
     
         // Esta bien, se puede eliminar
    proyecto.colaboradores.pull(req.body.id)
    // console.log(proyecto)
    // return
    await proyecto.save()
    res.json({msg:"Colaborador agregado correctamente"})

};




export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
   
}