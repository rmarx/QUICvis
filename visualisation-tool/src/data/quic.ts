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
    connectioninfo: ConnectionInfo | null
    headerinfo: Header|null
    payloadinfo: Payload|null
    serverinfo: Array<ServerInfo> | null
    size: number
}

export interface ConnectionInfo {
    src_ip_address: string
    src_port_number: number
    dst_ip_address: string
    dst_port_number: number
    time_delta: number
}

/**
 * Header Types
 */
//export type Header = LongHeader | ShortHeader | VersionHeader;

export interface Header {
    header_form: number|null
    dest_connection_id: string|null
    packet_number: number|null
}

export interface LongHeader extends Header{
    header_form: number|null
    dest_connection_id: string|null
    long_packet_type: number|null
    src_connection_id: string|null
    version: string|null
    packet_number: number|null
}

export interface ShortHeader extends Header{
    header_form: number|null
    dest_connection_id: string|null
    omit_conn_id: boolean
    key_phase: boolean
    short_packet_type: number
    packet_number: number
}

export interface VersionHeader{
    header_form: boolean
    long_packet_type: number
    dest_connection_id: number
    version: string
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

export interface Frame{
    frametype: number
}
//export type Frame = Padding | Rst_Stream | Application_Close | Max_Data | Max_Stream_Data | Max_Stream_Id | Ping | Blocked | Stream_Blocked | 
    //Stream_Id_Blocked | New_Connection_Id | Stop_Sending | Ack | Path_Challenge | Path_Response | Stream

export interface Padding extends Frame{
    length: number
}

export interface Rst_Stream extends Frame{
    stream_id: number
    application_error_code: number
    final_offset: number
}

export interface Connection_Close extends Frame{
    error_code: number
    phrase_length: number
    reason_phrase: string
}

export interface Application_Close extends Frame{
    error_code: number
    phrase_length: number
    reason_phrase: string
}

export interface Max_Data extends Frame{
    maximum_data: number
}

export interface Max_Stream_Data extends Frame{ 
    stream_id: number
    maximum_data: number
}

export interface Max_Stream_Id extends Frame{
    maximum_stream_id: number
}

export interface Ping extends Frame{
    totext: string
}

export interface Blocked extends Frame{
    offset: number
}

export interface Stream_Blocked extends Frame{
    stream_id: number
    offset: number
}

export interface Stream_Id_Blocked extends Frame{
    stream_id: number
}

export interface New_Connection_Id extends Frame{
    sequence: number
    connection_id: number
    stateless_rst_token: number
}

export interface Stop_Sending extends Frame{
    stream_id: number
    application_error_code: number
}

export interface Ack extends Frame{  
    largest_ack: number
    ack_delay: number
    ack_block_count: number
    ack_blocks: Array<AckBlock>
}

export interface AckBlock{
    ack_block_field: number
    gap_field: number
}

export interface Path_Challenge extends Frame{
    data: string
}

export interface Path_Response extends Frame{
    data: string
}

export interface Stream extends Frame{
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