import Payment from "../models/paymentModel.js"
import Invoice from "../models/invoiceModel.js"
import Order from "../models/orderModel.js"
import Receipt from "../models/receiptModel.js"
import { initiateStkPush } from "./external/darajaService.js"
import { initTransaction } from "./external/paystackService.js"


const generateReceiptNumber = () => `RCP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`


export const createPaymentRecord = async ({ invoice, method, amount }) => {
  const payment = await Payment.create({
    invoiceId: invoice._id,
    method,
    amount,
    currency: 'KES',
    status: ['cash', 'post_to_bill', 'cod'].includes(method) ? 'SUCCESS' : 'INITIATED',
    processorRefs: {}
  })
  return payment
}


export const applySuccessfulPayment = async ({ invoice, payment, io, method }) => {
  payment.status = 'SUCCESS'
  await payment.save()

  invoice.paymentStatus = 'PAID'
  invoice.balanceDue = 0
  await invoice.save()

  const order = await Order.findById(invoice.orderId)
  if (order) {
    order.paymentStatus = 'PAID'
    await order.save()
  }

  const receipt = await Receipt.create({
    orderId: invoice.orderId,
    invoiceId: invoice._id,
    receiptNumber: generateReceiptNumber(),
    amountPaid: payment.amount,
    paymentMethod: method,
    issuedAt: new Date(),
    pdfUrl: null
  })

  if (order) {
    order.receiptId = receipt._id
    await order.save()
  }

  io?.emit('payment.updated', { paymentId: payment._id.toString(), status: payment.status })
  io?.emit('receipt.created', { receiptId: receipt._id.toString(), orderId: String(invoice.orderId) })

  return { receipt }
}


export const initiateMpesaForInvoice = async ({ invoice, payment, amount, phone, callbackUrl }) => {
  const accountReference = invoice.number || invoice._id
  const res = await initiateStkPush({ amount, phone, accountReference, callbackUrl })
  payment.status = 'PENDING'
  payment.processorRefs = { ...payment.processorRefs, daraja: { merchantRequestId: res.merchantRequestId, checkoutRequestId: res.checkoutRequestId } }
  await payment.save()
  return res
}


export const initiatePaystackForInvoice = async ({ invoice, payment, amount, email, callbackUrl }) => {
  const reference = `INV-${invoice._id}-${Date.now()}`
  const res = await initTransaction({ amount, email, reference, callbackUrl, currency: process.env.PAYSTACK_CURRENCY || 'KES' })
  payment.status = 'PENDING'
  payment.processorRefs = { ...payment.processorRefs, paystack: { reference } }
  await payment.save()
  return res
}

