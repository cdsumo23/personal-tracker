async function run() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@budgetplanner.com',
        password: 'Demo@123456'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    
    const token = loginData.data.accessToken;
    console.log('Token extracted:', token.slice(0, 15) + '...');
    
    // Attempt to create transaction
    const txPayload = {
      description: 'Test Transaction',
      amount: 10.5,
      type: 'EXPENSE',
      accountId: 'demo-checking',
      categoryId: 'system-expense-food-&-dining',
      date: new Date().toISOString(),
      notes: null,
      tags: [],
      isRecurring: false,
      recurringInterval: null
    };
    
    console.log('Sending transaction creation payload:', txPayload);
    const txRes = await fetch('http://localhost:4000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(txPayload)
    });
    
    const txData = await txRes.json();
    console.log('Response Status:', txRes.status);
    console.log('Response Data:', JSON.stringify(txData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
