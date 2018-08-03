export function getLongHeaderName(value: number): string{
    let name = "Initial"
    switch (value) {
        case 127:
            name = "Initial"
            break;
        case 126:
            name = "Retry"
            break;
        case 125:
            name = "Handshake"
            break;
        case 124:
            name = "0-RTT Protected"
            break;
        default:
            break;
    }
    return name
}

export function getFrameName(value: number): string{
    let name = ""
    switch (value) {
        case 0:
            name = "Padding"
            break;
        case 1:
            name = "Rst_stream"
            break;
        case 2:
            name = "Conn_close"
            break;
        case 3:
            name = "App_close"
            break;
        case 4:
            name = "Max_data"
            break;
        case 5:
            name = "Max_str_data"
            break;
        case 6:
            name = "Max_str_id"
            break;
        case 7:
            name = "Ping"
            break;
        case 8:
            name = "Blocked"
            break;
        case 9:
            name = "Str_blocked"
            break;
        case 10:
            name = "Str_id_blocked"
            break;
        case 11:
            name = "New_conn_id"
            break;
        case 12:
            name = "Stop_sending"
            break;
        case 13:
            name = "Ack"
            break;
        case 14:
            name = "Path_ch"
            break;
        case 15:
            name = "Path_re"
            break;
        default:
            name = "Stream"
            break;
    }
    return name
}