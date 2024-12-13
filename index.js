const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000
//mw 
app.use(cors({
      origin: ['http://localhost:5173'],
      credentials: true
}))
app.use(express.json())
app.use(cookieParser())
const varifyToken = (req, res, next) => {
      console.log('inside verify Token', req.cookies)
      const token = req?.cookies?.token
      if (!token) {
            return res.status(401).send({ message: 'mama tumi kida tomake chinte parlam na' })
      }
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                  return res.status(401).send({ message: 'mama tumi kida tomake chinte parlam na' })
            }
            req.user = decoded
            next()

      })


}




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
            const jobsCollection = client.db('TalentFlare').collection("jobs")
            const categoryCollection = client.db('TalentFlare').collection("category")
            const userCollection = client.db('TalentFlare').collection("users")
            const jobApplicationCollection = client.db('TalentFlare').collection("job-application")

            let jobs;

            app.get('/alljobs', async (req, res) => {

                  const search = req.query.search
                  let option = {}
                  if (search) {
                        option = { title: { $regex: search, $options: "i" } }
                  }
                  const result = await jobsCollection.find(option).toArray()
                  res.send(result)
            })
            app.post('/jwt', async (req, res) => {
                  const user = req.body
                  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })

                  res
                        .cookie('token', token, {
                              httpOnly: true,
                              secure: false,
                        })
                        .send({ success: true })
            })
            app.get('/jobs', async (req, res) => {
                  const category = req.query.category
                  const { limit = 9 } = req.query

                  let query = {}
                  if (category) {
                        if (category == "All category") {

                              jobs = await jobsCollection.find().limit(Number(limit)).toArray()


                        }
                        else {
                              query = { category: category }
                              jobs = await jobsCollection.find(query).limit(Number(limit)).toArray()
                        }

                  }
                  else {
                        jobs = await jobsCollection.find().limit(Number(limit)).toArray()
                  }

                  res.send(jobs)
            })
            app.get('/categories', async (req, res) => {
                  const categories = await categoryCollection.find().toArray()
                  res.send(categories)
            })
            app.get('/jobs/:id',  async (req, res) => {
                  const id = req.params.id
                  const qur = { _id: new ObjectId(id) }
                  const result = await jobsCollection.findOne(qur)
                  res.send(result)
            })
            app.post('/users', async (req, res) => {
                  const user = req.body
                  const result = await userCollection.insertOne(user)
                  res.send(result)
            })
            app.post('/job-application', async (req, res) => {
                  let result;
                  const jobApplication = req.body
                  const job_id_qur = { job_id: jobApplication?.job_id }
                  const job = await jobApplicationCollection.findOne(job_id_qur)
                  if (job.applicantEmail === jobApplication.applicantEmail) {
                        result = { status: 'job already applyed' }
                  }
                  else {
                        result = await jobApplicationCollection.insertOne(jobApplication)
                  }
                  res.send(result)
            })
            app.get('/myapplication', varifyToken, async (req, res) => {
                  const email = req.query.email
                  if(req.user.email !== email) {
                        return res.status(403).send({ message: 'mama ata to tumi na' })
                  }
                  // console.log(req.cookies)
                  const query = { applicantEmail: email }
                  const result = await jobApplicationCollection.find(query).toArray()
                  for (let application of result) {
                        const query1 = { _id: new ObjectId(application.job_id) }
                        const job = await jobsCollection.findOne(query1)
                        if (job) {
                              application.job_title = job.title
                              application.company_logo = job.company_logo
                              application.applicationDeadline = job.applicationDeadline
                              application.status = job.status
                              application.location = job.location
                              application.jobType = job.jobType
                        }
                  }
                  res.send(result)
            })


            console.log("SUCCESSFULLY CONNECTED TO MONGODB");
      } finally {

      }
}
run().catch(console.dir);















app.get("/", (req, res) => {
      res.send({ status: true })
})

app.listen(port, () => {
      console.log(`SERVER IS RUNNING ON ${port}`)
})