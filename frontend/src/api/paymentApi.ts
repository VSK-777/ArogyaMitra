import { apiClient } from './client';

export const paymentApi = {
    createOrder: async (amount: number, currency: string = 'INR') => {
        const response = await apiClient.post('/api/payment/create-order', { amount, currency });
        return response.data;
    },
    verifyPayment: async (data: { razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }) => {
        const response = await apiClient.post('/api/payment/verify-payment', data);
        return response.data;
    }
};
