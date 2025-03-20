import { 
    upsertPayment, 
    findPaymentByUserId 
  } from '@/repositories/PaymentRepository';
  import { PaymentData } from '@/types/payment/PaymentTypes';
  
  /**
   * Update payment information
   */
  export async function updatePaymentInfo(userId: string, paymentData: PaymentData) {
    try {
      const updatedPayment = await upsertPayment(userId, {
        nameOnCard: paymentData.nameOnCard,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        saveCard: paymentData.saveCard,
      });
  
      return updatedPayment;
    } catch (error) {
      console.error("Failed to update payment information:", error);
      throw new Error("Failed to update payment information");
    }
  }
  
  /**
   * Get payment information for a user
   */
  export async function getUserPaymentInfo(userId: string) {
    try {
      const paymentInfo = await findPaymentByUserId(userId);
      return paymentInfo;
    } catch (error) {
      console.error("Failed to fetch payment information:", error);
      throw new Error("Failed to fetch payment information");
    }
  }