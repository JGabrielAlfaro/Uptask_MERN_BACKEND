
import  express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express(); // asignamos el dato de la funcion.
app.use(express.json()); //Procesa la información tipo JSON.
dotenv.config()
conectarDB();

// Configurar CORS
const whileList =[process.env.FRONTEND_URL, process.env.BACKEND_URL]

const corsOptions = {
    origin: function(origin,callback){
        // console.log(origin)
        if (whileList.includes(origin)){
            //Puede consultar la API
            callback(null,true)
        }else {
            //No esta permitido su request.
            callback(new Error("Error de CORS"))
        }
    },
}
app.use(cors(corsOptions))

//Routing
app.use('/api/usuarios',usuarioRoutes);
app.use('/api/proyectos',proyectoRoutes);
app.use('/api/tareas',tareaRoutes);

const PORT = process.env.PORT || 4000
const servidor = app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})

//SOCKET.IO
import {Server, Socket} from 'socket.io'
const io = new Server(servidor,{
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    },
})
io.on('connection', (socket)=>{
    console.log("Conectado a Socket.io")

    //Definir los eventos de socket io
   socket.on ('abrir proyecto',(idProyecto)=>{
    socket.join(idProyecto) // cada proyecto tiene un espacio de memoria.
    });

    //recibimos la tarea del provider
    socket.on('nueva tarea',(tarea)=>{
        // console.log(tarea)
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada',tarea)
    })

    //Recibimos con "on" la petición y enviamos una nueva petición con to y emit
    socket.on('eliminar tarea',(tarea)=>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada',tarea)
    })

    socket.on('actualizar tarea',(tarea)=>{
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada',tarea)
    })

    socket.on('cambiar estado',(tarea)=>{
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado',tarea)
    })

})

