fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 1, productId: 1 })
})
.then(res => res.json())
.then(data => console.log('✅ Success Order:', data))
.catch(console.error);

fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 999, productId: 1 })
})
.then(async res => ({status: res.status, data: await res.json()}))
.then(data => console.log('❌ Failed Order (Expected 404):', data))
.catch(console.error);
