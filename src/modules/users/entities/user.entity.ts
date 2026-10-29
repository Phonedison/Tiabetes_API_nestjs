export class User {
  id: string;
  email: string;
  userType: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    delete (this as any).passwordHash;
  }
}
