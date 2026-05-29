import axios from 'axios';

async function main() {
  try {
    // 1. Log in
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'franchise@erp.com',
      password: 'admin123'
    });
    const token = loginRes.data.accessToken;
    console.log('✅ Logged in successfully. Token acquired.');

    // 2. Fetch quotations to find a draft
    const quotationsRes = await axios.get('http://localhost:5000/api/sales/quotations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const drafts = quotationsRes.data.filter((q: any) => q.status === 'DRAFT');
    if (drafts.length === 0) {
      console.log('ℹ️ No draft quotation found. Creating one first...');
      const createRes = await axios.post('http://localhost:5000/api/sales/quotations', {
        quotationNumber: `QT-TEST-${Date.now()}`,
        customerId: null,
        customerName: 'Test Customer',
        customerPhone: '1234567890',
        validUntil: '2026-06-30',
        status: 'DRAFT',
        items: [
          { productName: 'Batter Dosa', quantity: 2, unit: 'NONE', rate: 40, taxPercent: 5 }
        ]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      drafts.push(createRes.data);
      console.log('✅ Draft quotation created.');
    }

    const draft = drafts[0];
    console.log(`ℹ️ Selected draft quotation ID: ${draft.id}`);

    // 3. Perform PATCH request to update
    const patchPayload = {
      quotationNumber: draft.quotationNumber,
      customerId: draft.customerId,
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      validUntil: draft.validUntil,
      status: 'DRAFT',
      items: [
        { productId: draft.items[0]?.productId || undefined, productName: 'Batter Dosa', quantity: 5, unit: 'NONE', rate: 40, taxPercent: 5 },
        { productId: undefined, productName: 'Batter Idly', quantity: 3, unit: 'kg', rate: 35, taxPercent: 5 }
      ],
      discountAmount: 10
    };

    console.log('Sending PATCH request...');
    const patchRes = await axios.patch(`http://localhost:5000/api/sales/quotations/${draft.id}`, patchPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ PATCH Response succeeded!');
    console.log('Updated Quotation status:', patchRes.data.status);
    console.log('Updated Quotation items count:', patchRes.data.items?.length);
    console.log('Updated Quotation total amount:', patchRes.data.totalAmount);
    console.log('Updated Quotation discount amount:', patchRes.data.discountAmount);

  } catch (error: any) {
    console.error('❌ API Request failed:', error.response?.data || error.message);
  }
  process.exit(0);
}

main();
