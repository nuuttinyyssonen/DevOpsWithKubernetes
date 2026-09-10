function generateRandomString(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const randomString = generateRandomString();

console.log(`Startup random string: ${randomString}`);

// Output it every 5 seconds with a timestamp
setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${randomString}`);
}, 5000);