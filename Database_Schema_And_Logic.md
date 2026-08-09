# PropFirm System: Architecture, Database Schema, and Core Logic

This document provides a comprehensive overview of the current WordPress-based Prop Firm system to assist in porting to a custom Node.js/Python stack.

## 1. High-Level Architecture
- **Backend Framework:** WordPress REST API (PHP).
- **Frontend Framework:** Next.js (React, Tailwind CSS, TypeScript).
- **Price Feed:** Python service (`mt5-price-service`) pulling data from MetaTrader 5 and serving/updating it.
- **Headless Bridge:** A WordPress plugin (`protradefx-headless-bridge`) that optimizes authentication (JWT) and bypasses the heavy WP loading pipeline for high-frequency trading API calls.

## 2. Database Schema (MySQL/MariaDB)
The system uses standard WordPress tables for users and custom tables for the trading engine. All custom tables are prefixed (e.g., `wp_fxsim_`).

### `fxsim_accounts`
Stores trader accounts.
- `id` (INT, PK)
- `user_id` (INT) - Maps to `wp_users.ID`
- `balance` (DECIMAL) - Realized balance
- `equity` (DECIMAL) - Floating equity (balance + unrealized PnL)
- `margin_used` (DECIMAL)
- `leverage` (INT)
- `status` (VARCHAR) - `active`, `breached`, `suspended`
- `challenge_status` (VARCHAR) - `phase1`, `phase2`, `funded`, `failed`, `passed`
- `plan_id` (INT) - Maps to `fxsim_challenge_plans`

### `fxsim_positions`
Stores currently OPEN trades.
- `id` (INT, PK)
- `account_id` (INT)
- `symbol` (VARCHAR)
- `type` (VARCHAR) - `buy` or `sell`
- `lot_size` (DECIMAL)
- `open_price` (DECIMAL)
- `current_price` (DECIMAL)
- `sl`, `tp` (DECIMAL)
- `pnl` (DECIMAL) - Unrealized Profit/Loss

### `fxsim_trades`
Stores CLOSED trades (Trade History).
- Contains the same fields as positions, plus:
- `close_price` (DECIMAL)
- `closed_at` (DATETIME)

### `fxsim_challenge_plans`
Stores the rules and parameters for purchasable prop firm challenges.
- `starting_balance` (DECIMAL)
- `phase1_target_pct`, `phase2_target_pct` (DECIMAL)
- `max_daily_loss_pct` (DECIMAL)
- `max_overall_loss_pct` (DECIMAL)
- `daily_loss_type` (VARCHAR) - `balance` (static) or `equity` (trailing)
- `max_inactivity_days` (INT)
- *Advanced Rules:* `news_trading`, `ea_allowed`, `weekend_holding`, `hedging_allowed` (Booleans)

### `fxsim_challenge_metrics`
Tracks EOD (End of Day) stats to calculate daily drawdown.
- `account_id` (INT)
- `date` (DATE)
- `start_of_day_balance` (DECIMAL)
- `start_of_day_equity` (DECIMAL)

---

## 3. Core Business Logic

### Drawdown Calculations
The engine (`class-challenge-engine.php`) evaluates accounts every time a trade is closed, and via a regular cron job.

*   **Max Daily Drawdown:** 
    Calculated using the metrics stored at the daily reset (00:00 server time). 
    If `daily_loss_type` is `balance`, the breach threshold is: `start_of_day_balance - (starting_balance * max_daily_loss_pct)`.
    If current `equity` drops below this threshold, the account is instantly breached.
*   **Max Overall Drawdown:**
    Always static based on the initial balance. 
    Threshold: `starting_balance - (starting_balance * max_overall_loss_pct)`.

### Profit Targets
Evaluated only when all positions are closed (flat account) to prevent passing with floating losses.
*   Threshold: `starting_balance + (starting_balance * phase_target_pct)`.
*   If equity >= threshold and minimum trading days are met, the account status advances (`phase1` -> `phase2` -> `funded`).

### Inactivity Rules
A cron job checks the `opened_at` or `closed_at` timestamps of the most recent trade in `fxsim_trades` and `fxsim_positions`. If the difference between now and the last trade exceeds `max_inactivity_days`, the account is breached.

### Trade Execution & Pricing
*   `open_position` and `close_position` are handled in `class-trading-engine.php`. 
*   It performs pre-trade checks: Margin availability (based on leverage and lot size), News Trading Lock (`fxsim_news_lock` option), and Weekend Holds.
*   Unrealized PnL is continuously recalculated by fetching live prices via the `mt5-price-service` and updating `fxsim_positions`.
