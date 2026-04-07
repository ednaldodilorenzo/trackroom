interface FormState {
    success: boolean;
    message: string;
    errors?: {
        password?: string[];
        confirmPassword?: string[];
        email?: string[];
    };
}

export type { FormState };