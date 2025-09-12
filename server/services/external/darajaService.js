import axios from "axios"


const getBaseUrl = () => {
  const env = (
    process.env.MPESA_ENV || 
    'sandbox'
  ).toLowerCase()
  return env === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'
}


export const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY 
    

  const consumerSecret = process.env.MPESA_CONSUMER_SECRET 
    

  if (!consumerKey || !consumerSecret) {
    throw new Error('Daraja credentials not configured')
  }

  const base = getBaseUrl()
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const response = await axios.get(
    `${base}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  )

  return response.data?.access_token
}


export const buildTimestamp = () => {
  return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
}


export const buildPassword = (shortCode, passkey, timestamp) => {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64')
}


export const initiateStkPush = async ({ amount, phone, accountReference, callbackUrl }) => {

  const shortCode = process.env.MPESA_SHORT_CODE 
    
    
  const passkey = process.env.MPESA_PASSKEY 

  const partyB = shortCode

  if (!shortCode || !passkey) {
    throw new Error('Daraja short code or passkey not configured')
  }

  const accessToken = await getAccessToken()
  const base = getBaseUrl()
  const timestamp = buildTimestamp()
  const password = buildPassword(shortCode, passkey, timestamp)

  const callback = callbackUrl || `${process.env.API_BASE_URL || ''}/api/payments/webhooks/mpesa`

  const payload = {
    BusinessShortCode: Number(shortCode),
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: Number(partyB),
    PhoneNumber: phone,
    CallBackURL: callback,
    AccountReference: String(accountReference),
    TransactionDesc: 'Invoice payment'
  }

  const resp = await axios.post(`${base}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  return {
    merchantRequestId: resp.data?.MerchantRequestID,
    checkoutRequestId: resp.data?.CheckoutRequestID,
    raw: resp.data
  }
}


export const parseCallback = (body) => {
  const stk = body?.Body?.stkCallback
  if (!stk) return { valid: false }

  const resultCode = stk.ResultCode
  const success = resultCode === 0
  const checkoutRequestId = stk.CheckoutRequestID

  let amount = null
  let phone = null
  const items = stk?.CallbackMetadata?.Item || []
  for (const item of items) {
    if (item?.Name === 'Amount') amount = item?.Value
    if (item?.Name === 'PhoneNumber') phone = item?.Value
  }

  return {
    valid: true,
    success,
    checkoutRequestId,
    amount,
    phone,
    raw: body
  }
}

