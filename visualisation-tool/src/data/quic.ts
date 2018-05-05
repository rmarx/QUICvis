export interface Trace{
    name: string
    connection: Array<QuicConnection> | null
}

export interface QuicConnection{
    CID_endpoint1: Array<string>|null
    CID_endpoint2: Array<string>|null
    packets: Array<QuicPacket>
}

export interface QuicPacket{
    src_ip_address: string
    src_port_number: number
    dst_ip_address: string
    dst_port_number: number
    headerinfo: Header|null
    payloadinfo: Payload|null
    time_delta: number
    serverinfo: Array<ServerInfo> | null
}

/**
 * Header Types
 */
//export type Header = LongHeader | ShortHeader | VersionHeader;

export interface Header {
    header_form: boolean|null
    dest_connection_id: string|null
}

export interface LongHeader extends Header{
    header_form: boolean|null
    dest_connection_id: string|null
    long_packet_type: number|null
    src_connection_id: string|null
    version: number|null
    packet_number: number|null
}

export interface ShortHeader extends Header{
    header_form: boolean|null
    dest_connection_id: string|null
    flags: {
        omit_conn_id: boolean
        key_phase: boolean
    }
    short_packet_type: number
    packet_number: number
}

export interface VersionHeader{
    header_form: boolean
    long_packet_type: number
    dest_connection_id: number
    version: number
}

/**
 * Payload
 */
export interface Payload{
    framelist: Array<Frame>
}

/**
 * Frame Types
 */
export type Frame = Padding | Rst_Stream | Application_Close | Max_Data | Max_Stream_Data | Max_Stream_Id | Ping | Blocked | Stream_Blocked | 
    Stream_Id_Blocked | New_Connection_Id | Stop_Sending | Ack | Path_Challenge | Path_Response | Stream

export interface Padding{
    length: number
}

export interface Rst_Stream{
    stream_id: number
    application_error_code: number
    final_offset: number
}

export interface Connection_Close{
    error_code: number
    phrase_length: number
    reason_phrase: string
}

export interface Application_Close{
    error_code: number
    phrase_length: number
    reason_phrase: string
}

export interface Max_Data{
    maximum_data: number
}

export interface Max_Stream_Data{
    stream_id: number
    maximum_data: number
}

export interface Max_Stream_Id{
    maximum_stream_id: number
}

export interface Ping{
    totext: string
}

export interface Blocked{
    offset: number
}

export interface Stream_Blocked{
    stream_id: number
    offset: number
}

export interface Stream_Id_Blocked{
    stream_id: number
}

export interface New_Connection_Id{
    sequence: number
    connection_id: number
    stateless_rst_token: number
}

export interface Stop_Sending{
    stream_id: number
    application_error_code: number
}

export interface Ack{  
    largest_ack: number
    ack_delay: number
    ack_block_count: number
    ack_blocks: Array<AckBlock>
}

export interface AckBlock{
    ack_block_field: number
    gap_field: number
}

export interface Path_Challenge{
    data: string
}

export interface Path_Response{
    data: string
}

export interface Stream{
    type_flags: {
        off_flag: boolean,
        len_flag: boolean,
        fin_flag: boolean
    }
    stream_id: number
    offset: number
    length: number
    stream_data: string
}

export interface ServerInfo{
    infotype: string,
    infocontent: string
}