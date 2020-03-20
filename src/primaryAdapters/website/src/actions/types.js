/**
 * Action types.
 *
 * How we have to named it? First the context (reducers name
 * files are a good reference, eg: user, client, chat...),
 * then the write the functionality that each reducer makes.
 */
export const APP_SETTINGS_FETCH = 'app_settings_fetch';
export const USER_SAVE = 'user_save';
export const FETCH_ALL_USERS = 'fetch_all_users';
export const SELECTED_USER = 'selected_user';
export const DELETE_SELECTED_USER = 'delete_selected_user';
export const EDIT_USER = 'edit_user';
export const CLIENT_FETCH = 'client_fetch';
export const CHAT_ROOMS_SAVE = 'chat_rooms_save';
export const CHAT_ROOMS_ROOM_FETCH = 'chat_rooms_room_fetch';
export const CHAT_ROOMS_UPDATE = 'chat_rooms_update';
export const CHAT_ROOM_SAVE = 'chat_room_save';
export const CHAT_ROOM_ATTRIBUTES_UPDATE = 'chat_room_attributes_update';
export const CHAT_PUBNUB_SAVE = 'chat_pubnub_save';
export const CHAT_GLOBAL_CHANNELS_SAVE = 'chat_global_channels_save';
export const CHAT_ROOM_CHANNELS_SAVE = 'chat_room_channels_save';
export const CHAT_ROOM_CHANNELS_RESET = 'chat_room_channels_reset';
export const CHAT_HISTORY_FETCH = 'chat_history_fetch';
export const CHAT_HISTORY_SAVE = 'chat_history_save';
export const CHAT_HISTORY_RESET = 'chat_history_reset';
export const CHAT_MESSAGE_SAVE = 'chat_message_save';
export const CHAT_STATUS_MESSAGE_SAVED_TO_DATABASE =
    'chat_status_message_saved_to_database';
export const CHAT_STATUS_MESSAGE_SEND = 'chat_status_message_send';
export const CHAT_SAVE_ATTACHED_FILE = 'chat_save_attached_file';
export const CHAT_DELETE_ALL_ATTACHED_FILES = 'chat_delete_all_attached_files';
export const FAQS_QUESTIONS_FETCH_ALL = 'faqs_questions_fetch_all';
export const FAQS_QUESTIONS_NEW = 'faqs_questions_new';
export const FAQS_QUESTIONS_EDIT = 'faqs_questions_edit';
export const FAQS_QUESTIONS_DELETE = 'faqs_questions_delete';
export const ERROR = 'error';
export const ERROR_CLIENT_SET_ATTRIBUTE = 'error_client_set_attribute';
export const ERROR_CHAT_FATAL = 'error_chat_fatal';
export const ERROR_CHAT_GENERAL = 'error_chat_general';
export const STATUS_CHAT_MAIN = 'status_chat_main';
export const STATUS_CHAT_FETCHING = 'status_chat_fetching';
export const COMPONENT_PROFILE_DIALOG = 'component_profile_dialog';
