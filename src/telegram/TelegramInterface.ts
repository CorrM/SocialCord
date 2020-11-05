export interface UserLogin {
    _:     string;
    flags: number;
    user:  User;
}

export interface Dialogs {
    _:        string;
    dialogs:  Dialog[];
    messages: Message[];
    chats:    any[];
    users:    User[];
}

export interface Dialog {
    _:                     string;
    flags:                 number;
    pinned:                boolean;
    unread_mark:           boolean;
    peer:                  Peer;
    top_message:           number;
    read_inbox_max_id:     number;
    read_outbox_max_id:    number;
    unread_count:          number;
    unread_mentions_count: number;
    notify_settings:       NotifySettings;
    draft?:                Draft;
}

export interface Draft {
    _:     string;
    flags: number;
    date:  number;
}

export interface NotifySettings {
    _:              string;
    flags:          number;
    show_previews?: boolean;
    silent?:        boolean;
    mute_until?:    number;
    sound?:         string;
}

export interface Peer {
    _:       ToID;
    user_id: number;
}

export enum ToID {
    PeerUser = "peerUser",
}

export interface Message {
    _:                string;
    flags:            number;
    out:              boolean;
    mentioned:        boolean;
    media_unread:     boolean;
    silent:           boolean;
    post:             boolean;
    from_scheduled:   boolean;
    legacy:           boolean;
    edit_hide:        boolean;
    id:               number;
    from_id:          number;
    to_id:            Peer;
    date:             number;
    message:          string;
    entities?:        Entity[];
    reply_markup?:    ReplyMarkup;
    fwd_from?:        FwdFrom;
    media?:           Media;
    grouped_id?:      string;
    reply_to_msg_id?: number;
}

export interface Entity {
    _:      EntityEnum;
    offset: number;
    length: number;
    url?:   string;
}

export enum EntityEnum {
    MessageEntityBold = "messageEntityBold",
    MessageEntityBotCommand = "messageEntityBotCommand",
    MessageEntityTextURL = "messageEntityTextUrl",
}

export interface FwdFrom {
    _:                 string;
    flags:             number;
    from_id:           number;
    date:              number;
    saved_from_peer:   Peer;
    saved_from_msg_id: number;
}

export interface Media {
    _:     string;
    flags: number;
    photo: MediaPhoto;
}

export interface MediaPhoto {
    _:              string;
    flags:          number;
    has_stickers:   boolean;
    id:             string;
    access_hash:    string;
    file_reference: { [key: string]: number };
    date:           number;
    sizes:          Size[];
    dc_id:          number;
}

export interface Size {
    _:         string;
    type:      string;
    bytes?:    { [key: string]: number };
    location?: PhotoBig;
    w?:        number;
    h?:        number;
    size?:     number;
}

export interface PhotoBig {
    _:         PhotoSmall;
    volume_id: string;
    local_id:  number;
}

export enum PhotoSmall {
    FileLocationToBeDeprecated = "fileLocationToBeDeprecated",
}

export interface ReplyMarkup {
    _:         string;
    flags:     number;
    selective: boolean;
}

export interface User {
    _:                 string;
    flags:             number;
    self:              boolean;
    contact:           boolean;
    mutual_contact:    boolean;
    deleted:           boolean;
    bot:               boolean;
    bot_chat_history:  boolean;
    bot_nochats:       boolean;
    verified:          boolean;
    restricted:        boolean;
    min:               boolean;
    bot_inline_geo:    boolean;
    support:           boolean;
    scam:              boolean;
    id:                number;
    access_hash:       string;
    first_name:        string;
    phone?:            string;
    photo?:            UserPhoto;
    status?:           Status;
    username?:         string;
    bot_info_version?: number;
    last_name?:        string;
}

export interface UserPhoto {
    _:           string;
    photo_id:    string;
    photo_small: PhotoBig;
    photo_big:   PhotoBig;
    dc_id:       number;
}

export interface Status {
    _:           string;
    was_online?: number;
}
