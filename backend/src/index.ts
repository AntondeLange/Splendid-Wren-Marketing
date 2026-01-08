import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' })
})

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Splendid Wren Backend!' })
})

app.post('/api/contact', (req, res) => {
  const { name, businessName, email, message } = req.body
  
  if (!name || !businessName || !email || !message) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, businessName, email, message' 
    })
  }

  console.log('Contact form submission:', { name, businessName, email, message })
  
  res.json({ 
    success: true, 
    message: 'Contact form submitted successfully' 
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
})

