import sys

filepath = r'C:\Users\Administrator\Local Sites\propfirm\app\public\wp-content\plugins\propfirm-system\includes\class-rest-api.php'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "register_rest_route(self::NS, '/admin/risk/alerts',                         ['methods'=>'GET', 'callback'=>[self::class,'admin_risk_alerts'],       'permission_callback'=>$is_admin]);"
replace1 = target1 + "\n        register_rest_route(self::NS, '/admin/risk/exposure',                       ['methods'=>'GET', 'callback'=>[self::class,'admin_risk_exposure'],     'permission_callback'=>$is_admin]);"

target2 = """        return new WP_REST_Response([
            'hft_risks' => $map_users($hft, 'hft_trades'),
            'gambling_risks' => $map_users($gambling, 'massive_trades'),
            'open_flags' => (int)$flags
        ]);
    }
}"""

replace2 = """        return new WP_REST_Response([
            'hft_risks' => $map_users($hft, 'hft_trades'),
            'gambling_risks' => $map_users($gambling, 'massive_trades'),
            'open_flags' => (int)$flags
        ]);
    }

    /** GET /admin/risk/exposure - Returns total open lot sizes grouped by symbol and direction (buy/sell). */
    public static function admin_risk_exposure(WP_REST_Request $r): WP_REST_Response {
        global $wpdb;
        $table = $wpdb->prefix . 'fxsim_trade_history';
        
        $exposure = $wpdb->get_results("
            SELECT symbol, cmd, SUM(lot_size) as total_lots, COUNT(*) as trade_count 
            FROM $table 
            WHERE status = 'open' 
            GROUP BY symbol, cmd 
            ORDER BY total_lots DESC
        ");
        
        return new WP_REST_Response($exposure ?? []);
    }
}"""

if target1 not in content:
    print('Failed to find target1')
    sys.exit(1)

if target2 not in content:
    print('Failed to find target2')
    sys.exit(1)

content = content.replace(target1, replace1)
content = content.replace(target2, replace2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
