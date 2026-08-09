import sys
import re

filepath = r'C:\Users\Administrator\Local Sites\propfirm\app\public\wp-content\plugins\propfirm-system\includes\class-rest-api.php'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add routes
routes_hook = "register_rest_route(self::NS, '/admin/tickets',"
routes_to_add = """        // Theme Settings (No-Code Editor)
        register_rest_route(self::NS, '/theme',                             ['methods'=>'GET', 'callback'=>[self::class,'theme_get'],             'permission_callback'=>'__return_true']);
        register_rest_route(self::NS, '/admin/theme',                       ['methods'=>'POST','callback'=>[self::class,'admin_theme_save'],      'permission_callback'=>$is_admin]);
"""

if routes_hook not in content:
    print("Routes hook not found")
    sys.exit(1)

content = content.replace(routes_hook, routes_to_add + "\n        " + routes_hook)

methods_to_add = """
    // --- THEME ENDPOINTS ---

    public static function theme_get(WP_REST_Request $r): WP_REST_Response {
        $default = [
            'primaryColor' => '#0f172a',
            'primaryForeground' => '#ffffff',
            'radius' => '0.5rem',
            'fontFamily' => 'Inter, sans-serif'
        ];
        $settings = get_option('fxsim_theme_settings', $default);
        if (!is_array($settings)) $settings = $default;
        return new WP_REST_Response($settings);
    }

    public static function admin_theme_save(WP_REST_Request $r): WP_REST_Response {
        $body = $r->get_json_params() ?: $r->get_body_params();
        $settings = [
            'primaryColor' => sanitize_hex_color($body['primaryColor'] ?? '#0f172a') ?: '#0f172a',
            'primaryForeground' => sanitize_hex_color($body['primaryForeground'] ?? '#ffffff') ?: '#ffffff',
            'radius' => sanitize_text_field($body['radius'] ?? '0.5rem'),
            'fontFamily' => sanitize_text_field($body['fontFamily'] ?? 'Inter, sans-serif')
        ];
        update_option('fxsim_theme_settings', $settings, false);
        return self::ok('Theme saved', $settings);
    }
"""

end_hook = "}\n}"
if content.endswith(end_hook):
    content = content[:-2] + methods_to_add
else:
    # Try alternate end hook
    match = re.search(r'\}\s*\}\s*$', content)
    if match:
        content = content[:match.start()] + methods_to_add
    else:
        print("End hook not found")
        sys.exit(1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
