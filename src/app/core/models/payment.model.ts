export interface StkPushRequest {
  phone_number: string;
  amount: string | number;
  name?: string;
}

export interface StkPushResponse {
  checkout_request_id: string;
  customer_message: string;
}

export type MpesaPaymentStatus = 'Pending' | 'Success' | 'Failed' | 'Timeout';

export interface MpesaStatus {
  checkout_request_id: string;
  status: MpesaPaymentStatus;
  mpesa_receipt: string;
  result_desc: string;
  amount: string;
}
