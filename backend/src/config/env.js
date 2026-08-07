require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/casefile',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openaiTemperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.2'),
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  uploadPath: process.env.UPLOAD_PATH || 'uploads',
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '25', 10)
};
