import { pool } from "../utils/db/pool";
import dotenv from 'dotenv';

dotenv.config();

export class ConfigService {
    static async GetConfigs() {
        let conn;

        try {
            conn = await pool.getConnection();
            const rows = await conn.query("SELECT `configKey`, `configValue` FROM config");
            const configs: { [key: string]: string } = {};

            for (const row of rows) {
                configs[row.configKey] = row.configValue;
            }

            return configs;

        } catch (err) {
            console.error(err);
            return {};
        } finally {
            if (conn) conn.release();
        }
    }

    static async GetConfig(configKey: string) {
        let conn;

        try {
            conn = await pool.getConnection();
            const rows = await conn.query("SELECT configValue FROM config WHERE `configKey` = ?", [configKey]);

            if (rows.length === 0)
                return null;

            return rows[0].configValue;

        } catch (err) {
            console.error(err);
            return null;
        } finally {
            if (conn) conn.release();
        }
    }

    static async SetConfig(configKey: string, configValue: string) {
        let conn;

        try {
            conn = await pool.getConnection();
            await conn.query("INSERT INTO config (`configKey`, `configValue`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `configValue` = ?", [configKey, configValue, configValue]);
            return true;

        } catch (err) {
            console.error(err);
            return false;
        } finally {
            if (conn) conn.release();
        }
    }

    static async StartMaintenanceMode() {
        return this.SetConfig('maintenanceMode', 'active');
    }

    static async EndMaintenanceMode() {
        return this.SetConfig('maintenanceMode', 'inactive');
    }
}