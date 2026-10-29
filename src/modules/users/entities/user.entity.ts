import type { users } from '../../../generated/client/client.js';

export class User implements Omit<users, 'password_hash'> {
  id: string;
  email: string;
  user_type: users['user_type'];
  created_at: Date;
  updated_at: Date;

  constructor(user: Omit<users, 'password_hash'>) {
    this.id = user.id;
    this.email = user.email;
    this.user_type = user.user_type;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }
}
