export type ProgrammeStatus = 'Planned' | 'StartingSoon' | 'Running';
export type ContactMethod = 'WhatsApp' | 'Email';

export interface Programme {
  id: string;
  name: string;
  blurb: string;
  status: ProgrammeStatus;
  external_url: string;
  starts_note: string;
  ordering: number;
}

export interface ProgrammeInterestPayload {
  name?: string;
  contact_method: ContactMethod;
  contact_value: string;
}
