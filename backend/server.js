require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const {
    verifyToken,
    authorizeRole
} = require("./middleware/authMiddleware");

const app = express();


connectDB();

app.use(cors());

app.use(express.json());

//app.use("/profiles", profileRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req,res)=>{
    res.send("Backend Running");
});

app.get(
    "/api/admin",
    verifyToken,
    authorizeRole("admin"),
    (req,res)=>{

        res.json({
            message:"Admin access granted",
            user:req.user
        });

    }
);



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});

app.get(
    "/api/protected",
    verifyToken,
    (req,res)=>{

        res.json({

            message:
                "Protected route works",

            user:req.user

        });

    }
);
