export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Goal {
    id: number;
    name: string;
    current_value: number;
    target_value: number;
    unit: string;
    color?: 'emerald' | 'amber' | 'red';
    start_date: string;
    end_date: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    completed_at?: string | null;
    priority: 'high' | 'medium' | 'low';
    due_date?: string;
}

export interface Contact {
    id: number;
    name: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
    last_contact_date?: string;
    notes?: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
    flash?: {
        message?: string;
        error?: string;
    };
}
