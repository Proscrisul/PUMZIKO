import { ContactMethod } from './programme.model';

export type EnquirySource = 'Contact' | 'WhatToExpect' | 'Programme' | 'Visit';

export interface EnquiryPayload {
  name?: string;
  contact_method: ContactMethod;
  contact_value: string;
  message?: string;
  source: EnquirySource;
}
