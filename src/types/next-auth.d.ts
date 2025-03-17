// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type NextAuth from "next-auth"; // Import type from next-auth, necessary for type augmentation

declare module "next-auth" {
    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}
