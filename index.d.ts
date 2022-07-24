/// <references types="next-auth" />

declare global {
  module "next-auth" {
    interface User extends DefaultSession["user"] {
      id: string;
    }

    interface Session {
      user: User;
    }
  }
}
