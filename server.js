import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import mogran from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
// cors makes errror free connection between two ports
import cors from "cors";
import CategoryRoutes from "./routes/CategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
// import path from "path";
//configure env
dotenv.config();

//database config
connectDB();

//rest object
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(mogran("dev"));
// app.use(express.static(path.join(__dirname,'./client/build')))

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", CategoryRoutes);
app.use("/api/v1/product", productRoutes);

//rest api
// app.use("*",function(req,res){
//     res.sendFile(path.join(__dirname,"./client/build/index.html"));
// })
app.get("/", (req, res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
});
//port
const port = process.env.PORT || 8000;

//run listen
app.listen(port, () => {
    // console.log(`server running on ${port}`.bgCyan.white);
})