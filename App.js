const express=require("express")
const mysql=require("mysql")
const cors=require("cors")
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const bcrypt=require("bcrypt")
const app=express();
app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",      
    methods:["POST","GET"],               
                       
    credentials:true                      
}));
app.listen(8081,()=>{
    console.log("nodejs connected");
})
const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"sumanraj1730",
    database:'tictactoe'
})
db.connect((err)=>{ 
    if(err)
        console.log(err)
    else
        console. log(" database Connected")    
})
app.post('/signup', async (req, res) => {
    try {
        const saltRounds = 10;
       
        const hash = await bcrypt.hash(req.body.password.toString(), saltRounds);

        const sql = "INSERT INTO DETAILS (`name`, `email`, `password`) VALUES ?";
        const values = [
            [req.body.name, req.body.email, hash]
        ];

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ Error: "Inserting data error" });
            }
            return res.json({ Status: "Success" });
        })
    } catch (err) {
        console.log(err);
        return res.json({ Error: "Error from hashing" });
    }
});

app.post('/login', (req, res) => {
    console.log("Hai ")
    try {
        const email = req.body.email;
        const password = req.body.password;
    console.log(email);

    console.log(password)

        
        const sql = `SELECT * FROM DETAILS WHERE email='${email}'`;
        console.log(sql);
        db.query(sql, (err, data) => {
            console.log(err,data)
            if (err) {
                console.error(err);
                return res.status(500).json({ Error: "Login error in server" });
            }

            else if (data.length > 0) {
                
                bcrypt.compare(password, data[0].password, (err, response) => {
                    if (err) {
                        console.error(err);
                        return res.json({ Error: "Password compare error" });
                    }

                    if (response) {
                        const name=data[0].name;    
                        const token=jwt.sign({email}, "jwt-secret-key",{expiresIn:'1w'});  //j
                        console.log(token);
                        res.cookie("token",token,{
                            httpOnly: true,
                            secure: true,
                        })  
                    
                        return res.json({ Status: "Success",name:name });
                    } else {
                       
                        return res.json({ Error: "Incorrect password" });
                    }
                });
            } else {

                return res.json({ Error: "Email not found" });
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ Error: "Server error" });
    }
});
function verifyToken(t) {
    try {
      const decoded = jwt.verify(t, "jwt-secret-key");
      return decoded;
    } catch (error) {
      return null; 
    }
  }
app.get("/count",(req,res)=>{

    try{
         var tokens=req.cookies["token"];
         console.log(req.cookies)
         console.log(tokens)

         const decodedToken = verifyToken(tokens);
         console.log(decodedToken);
        if (!decodedToken) {
            console.log('Token is invalid or expired.');
            return res.json({ Error: "Token not found" });

           }
           const sql = "UPDATE DETAILS SET gamesplayed = gamesplayed + 1 WHERE email = ?";
           const values = [decodedToken.email];
   
           db.query(sql, [values], (err, result) => {
               if (err) {
                   console.log(err);
                   return res.json({ Error: "Inserting data error" });
               }
               return res.json({ Status: "Success" });
           })

    }
    catch(err)
    {
        console.error(err);
        return res.json({ Error: "Server error" });

    }
})