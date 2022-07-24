declare global {
  interface User {
    id: string;
  }

  module "next-auth" {
    interface Session {
      user: User;
    }
  }
}
