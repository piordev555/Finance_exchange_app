interface Transaction {
  pic: string;
  amount_in_euros: any;
  name: string;
  type: string;
  country: string;
  date: string;
  status: string;
  destination_user: any;
}

interface Beneficiary {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  verification: boolean;
  rating: number;
}

interface User {
  email: string;
  id?: string;
  external_user_id?: string;
  updated_at?: string;
  created_at?: string;
  is_active?: boolean;
  is_archived?: boolean;
  full_phone_number: string;
  full_name: string;
  first_name: string;
  hasGcMandate?: boolean;
  client?: any;
  staff?: any;
  company?: any;
  agent?: any;
  documents?: any[];
}

interface payloadData {
    last_name: string;
    first_name: string;
    email?: string;
    phone_number: string;
    country_code: string;
}