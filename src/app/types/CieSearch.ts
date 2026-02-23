export type PaymentStatus =
  | 'PAGATO'
  | 'NON_PAGATO'
  | 'IN_ATTESA'
  | 'ANNULLATO'
  | string;

export interface SearchCieTransactionsRequest {
  enteFiscalCode: string;      
  citizenFiscalCode: string;   
  nav: string;
}

export interface PaymentProof {
  receiptUrl?: string;
  rawPayload?: unknown;
}

export interface CiePaymentTransaction {
  id: string;
  nav: string;
  transactionId?: string;
  paymentDateTime?: string;
  status: PaymentStatus;
  trackingInfo?: string;
  proof?: PaymentProof;
}

export interface SearchCieTransactionsResponse {
  transactions: CiePaymentTransaction[];
}