require('dotenv').config();
const axios = require('axios');

const MODEL = 'openai/gpt-oss-20b';
console.log('Testing Groq with model:', MODEL);
console.log('API Key:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.slice(0, 15) + '...' : 'NOT FOUND');

axios.post(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    model: MODEL,
    messages: [{ role: 'user', content: 'Reply with exactly: Groq is working!' }]
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
)
.then(res => {
  console.log('\n✅ SUCCESS! Groq API is working.');
  console.log('Model used:', MODEL);
  console.log('Response:', res.data.choices[0].message.content);
})
.catch(err => {
  console.log('\n❌ FAILED.');
  console.log('Status:', err.response?.status);
  console.log('Error:', JSON.stringify(err.response?.data, null, 2));
});
