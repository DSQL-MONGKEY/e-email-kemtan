export type LettersVRow = {
   id: string;
   number_text: string;
   issued_on: string;   // ISO date
   category_code: string;
   division_code: string;
   division_name: string;
   global_serial: number;
   daily_serial: number;
   created_at: string;
};

export type OverviewSeriesRow = { issued_on: string; cnt: number };
export type OverviewTopCategoryRow = { category_code: string; cnt: number };
export type OverviewTopDivisionRow = { division_code: string; division_name: string; cnt: number };
export type OverviewVisitorRow = { user_id: string; user_email: string; user_name: string; last_seen: string };

export type MastersCategory = { code: string; name: string; is_active?: boolean };
export type MastersDivision = { id: string; code: string; name: string };

export type NumbersGetResponse = {
   items: LettersVRow[];
   total: number;
   page: number;
   limit: number;
};

export type GenerateNumberResponse = {
   id: string;
   number: string;
   issuedOn: string;
   category: string;
   divisionId: string;
   globalSerial: number;
   dailySerial: number;
};
