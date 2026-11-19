 const  mongodb=require('mongoose')
 const denv=require('dotenv')

 denv.config()

 const connectDb =  async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
        if (!mongoUrl) throw new Error('MONGODB_URL is required');
        await mongodb.connect(mongoUrl)
        console.log("mongodb Connected....")
        
    } catch (error) {
        console.error("MongoDB connection failed:", error.message)
        throw error;
    }
    
 }
   module.exports=connectDb;
