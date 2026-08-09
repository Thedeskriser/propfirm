import sys
import re

filepath = r'C:\Users\Administrator\Local Sites\propfirm\app\public\wp-content\plugins\propfirm-system\includes\class-rest-api.php'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add routes
routes_hook = "register_rest_route(self::NS, '/admin/risk/exposure',"
routes_to_add = """        // Helpdesk & CRM Ticket System
        register_rest_route(self::NS, '/admin/tickets',                     ['methods'=>'GET', 'callback'=>[self::class,'admin_tickets_list'],    'permission_callback'=>$is_admin]);
        register_rest_route(self::NS, '/admin/tickets/(?P<id>\d+)',         ['methods'=>'GET', 'callback'=>[self::class,'admin_ticket_get'],      'permission_callback'=>$is_admin]);
        register_rest_route(self::NS, '/admin/tickets/(?P<id>\d+)/reply',   ['methods'=>'POST','callback'=>[self::class,'admin_ticket_reply'],    'permission_callback'=>$is_admin]);
        register_rest_route(self::NS, '/admin/tickets/(?P<id>\d+)/status',  ['methods'=>'POST','callback'=>[self::class,'admin_ticket_status'],   'permission_callback'=>$is_admin]);
        
        register_rest_route(self::NS, '/user/tickets',                      ['methods'=>'GET', 'callback'=>[self::class,'user_tickets_list'],     'permission_callback'=>$is_user]);
        register_rest_route(self::NS, '/user/tickets',                      ['methods'=>'POST','callback'=>[self::class,'user_ticket_create'],    'permission_callback'=>$is_user]);
        register_rest_route(self::NS, '/user/tickets/(?P<id>\d+)',          ['methods'=>'GET', 'callback'=>[self::class,'user_ticket_get'],       'permission_callback'=>$is_user]);
        register_rest_route(self::NS, '/user/tickets/(?P<id>\d+)/reply',    ['methods'=>'POST','callback'=>[self::class,'user_ticket_reply'],     'permission_callback'=>$is_user]);
"""

if routes_hook not in content:
    print("Routes hook not found")
    sys.exit(1)

content = content.replace(routes_hook, routes_to_add + "\n        " + routes_hook)

methods_to_add = """
    // --- TICKETS ENDPOINTS ---

    public static function admin_tickets_list(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $t_tickets = $wpdb->prefix . 'fxsim_tickets';
        
        $sql = "SELECT t.*, u.user_email, u.display_name, 
                (SELECT message FROM {$wpdb->prefix}fxsim_ticket_messages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as latest_message
                FROM $t_tickets t
                LEFT JOIN {$wpdb->prefix}users u ON t.user_id = u.ID
                ORDER BY t.updated_at DESC";
        $results = $wpdb->get_results($sql);
        return new WP_REST_Response($results);
    }

    public static function admin_ticket_get(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $id = (int)$r['id'];
        $ticket = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}fxsim_tickets WHERE id = %d", $id));
        if (!$ticket) return self::err('Ticket not found', 404);
        
        $messages = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}fxsim_ticket_messages WHERE ticket_id = %d ORDER BY created_at ASC", $id));
        return new WP_REST_Response(['ticket' => $ticket, 'messages' => $messages]);
    }

    public static function admin_ticket_reply(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $id = (int)$r['id'];
        $msg = sanitize_textarea_field($r->get_json_params()['message'] ?? '');
        if (!$msg) return self::err('Message is required');

        $wpdb->insert($wpdb->prefix . 'fxsim_ticket_messages', [
            'ticket_id' => $id,
            'sender_type' => 'admin',
            'sender_id' => get_current_user_id(),
            'message' => $msg
        ]);
        $wpdb->update($wpdb->prefix . 'fxsim_tickets', ['status' => 'pending', 'updated_at' => current_time('mysql')], ['id' => $id]);
        return self::ok('Reply added');
    }

    public static function admin_ticket_status(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $id = (int)$r['id'];
        $status = sanitize_text_field($r->get_json_params()['status'] ?? '');
        $wpdb->update($wpdb->prefix . 'fxsim_tickets', ['status' => $status, 'updated_at' => current_time('mysql')], ['id' => $id]);
        return self::ok('Status updated');
    }

    public static function user_tickets_list(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $uid = get_current_user_id();
        $tickets = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}fxsim_tickets WHERE user_id = %d ORDER BY updated_at DESC", $uid));
        return new WP_REST_Response($tickets);
    }

    public static function user_ticket_create(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $uid = get_current_user_id();
        $p = $r->get_json_params();
        
        $wpdb->insert($wpdb->prefix . 'fxsim_tickets', [
            'user_id' => $uid,
            'subject' => sanitize_text_field($p['subject'] ?? ''),
            'category' => sanitize_text_field($p['category'] ?? 'general'),
            'status' => 'open'
        ]);
        $ticket_id = $wpdb->insert_id;
        
        if (!empty($p['message'])) {
            $wpdb->insert($wpdb->prefix . 'fxsim_ticket_messages', [
                'ticket_id' => $ticket_id,
                'sender_type' => 'user',
                'sender_id' => $uid,
                'message' => sanitize_textarea_field($p['message'])
            ]);
        }
        return self::ok('Ticket created', ['ticket_id' => $ticket_id]);
    }

    public static function user_ticket_get(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $id = (int)$r['id'];
        $uid = get_current_user_id();
        
        $ticket = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}fxsim_tickets WHERE id = %d AND user_id = %d", $id, $uid));
        if (!$ticket) return self::err('Ticket not found', 404);
        
        $messages = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}fxsim_ticket_messages WHERE ticket_id = %d ORDER BY created_at ASC", $id));
        return new WP_REST_Response(['ticket' => $ticket, 'messages' => $messages]);
    }

    public static function user_ticket_reply(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $id = (int)$r['id'];
        $uid = get_current_user_id();
        $msg = sanitize_textarea_field($r->get_json_params()['message'] ?? '');
        
        $ticket = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}fxsim_tickets WHERE id = %d AND user_id = %d", $id, $uid));
        if (!$ticket) return self::err('Ticket not found', 404);

        $wpdb->insert($wpdb->prefix . 'fxsim_ticket_messages', [
            'ticket_id' => $id,
            'sender_type' => 'user',
            'sender_id' => $uid,
            'message' => $msg
        ]);
        $wpdb->update($wpdb->prefix . 'fxsim_tickets', ['status' => 'open', 'updated_at' => current_time('mysql')], ['id' => $id]);
        return self::ok('Reply sent');
    }
}
"""

end_hook = "}\n}"
if content.endswith(end_hook):
    content = content[:-2] + methods_to_add
else:
    print("End hook not found")
    
    # Try alternate end hook
    match = re.search(r'\}\s*\}\s*$', content)
    if match:
        content = content[:match.start()] + methods_to_add
    else:
        sys.exit(1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
