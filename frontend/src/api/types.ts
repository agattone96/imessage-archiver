export interface Chat {
    chat_guid: string;
    display_names: string;
    msg_count: number;
    last_date: string | null;
    badges: string;
}

export interface Message {
    row_id: number;
    text: string;
    is_from_me: boolean;
    date: string;
    handle_id: number | null;
    sender_name: string | null;
}

export interface GlobalStats {
    total_messages: number;
    total_chats: number;
    top_contact_handle: string;
    top_contact_count: number;
    storage_path: string;
}

export interface OnboardingStatus {
    complete: boolean;
    step: number;
}
