const express = require('express');
const cors = require('cors');
const app = express() 
require('dotenv').config()
const port = process.env.PORT || 8080
//mw 
app.use(cors())
app.use(express.json())






const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.negmw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
      const jobsCollection =  client.db('TalentFlare').collection("jobs") 
      const categoryCollection =  client.db('TalentFlare').collection("category") 
      

      app.get('/jobs', async (req,res) =>{
            const jobs = await jobsCollection.find().toArray()
            res.send(jobs)
      })
      app.get('/categories', async (req,res) =>{
            const categories = await categoryCollection.find().toArray()
            res.send(categories)
      })
    
   
    console.log("SUCCESSFULLY CONNECTED TO MONGODB");
  } finally {
    
  }
}
run().catch(console.dir);















app.get("/", (req,res) => {
      res.send({status:true})
})

app.listen(port ,()=>{
      console.log(`SERVER IS RUNNING ON ${port}`)
})