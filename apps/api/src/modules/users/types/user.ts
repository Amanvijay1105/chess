import type { Role, Status } from '../../../generated/prisma/client.js';

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  status: Status;
  isVerified: boolean;
  avatarUrl?: string | null;
  countryCode?: string | null;
  bio?: string | null;
}
