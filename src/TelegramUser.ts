export interface TelegramUser {
    _:     string;
    flags: number;
    user:  User;
}

interface User {
    _:                string;
    flags:            number;
    self:             boolean;
    contact:          boolean;
    mutual_contact:   boolean;
    deleted:          boolean;
    bot:              boolean;
    bot_chat_history: boolean;
    bot_nochats:      boolean;
    verified:         boolean;
    restricted:       boolean;
    min:              boolean;
    bot_inline_geo:   boolean;
    support:          boolean;
    scam:             boolean;
    id:               number;
    access_hash:      string;
    first_name:       string;
    last_name:        string;
    username:         string;
    phone:            string;
    status:           Status;
}

interface Status {
    _:          string;
    was_online: number;
}