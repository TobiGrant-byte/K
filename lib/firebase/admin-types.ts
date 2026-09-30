export type AdminRecord = {
  uid: string;
  username: string;
  email: string;
  providers: string[];
  createdAt: string | null;
  createdBy: string;
  updatedAt: string | null;
};
