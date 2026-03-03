export interface CiePaidNoticeRequest {
  organizationFiscalCode: string;
  debtorFiscalCode: string;
  nav: string;
  token?: string;
}

export interface UserDetail {
  name?: string;
  taxCode: string;
}

export interface CiePaidNoticeDetail {
  subject?: string;
  amount?: number | string;
  debtor?: UserDetail;
  payee?: UserDetail;
  refNumberType?: string;
  refNumberValue?: string;
}