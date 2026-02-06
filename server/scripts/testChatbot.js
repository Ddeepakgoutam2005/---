
async function testChat(message) {
  console.log(`Sending: "${message}"`);
  try {
    const res = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }]
      })
    });
    
    if (!res.ok) {
        const txt = await res.text();
        console.log('Error:', res.status, txt);
        return;
    }

    const data = await res.json();
    console.log('Reply:', data.reply);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

async function run() {
  await testChat('Who is the Prime Minister of India?');
  console.log('---');
  await testChat('How do I bake a chocolate cake?');
}

run();
