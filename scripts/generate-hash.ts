import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'Admin123!'
  const hash = await bcrypt.hash(password, 10)
  console.log('Password:', password)
  console.log('Hash:', hash)
  
  // Test it
  const isValid = await bcrypt.compare(password, hash)
  console.log('Validation:', isValid)
}

generateHash()