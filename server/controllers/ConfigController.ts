import express from 'express';
import verifyUser from '../utils/verifyUser';
import { ConfigService } from '../services/ConfigService';

const router = express.Router();

router.use((req, res, next) => {
    if (req.path === '/' && req.method === 'GET') {
        return next();
    }

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = verifyUser(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return next();
});

router.get('/', async (req, res) => {
    const configs = await ConfigService.GetConfigs();

    if (Object.keys(configs).length === 0) {
        return res.status(404).json({ success: false, message: "No configs found" });
    }

    res.json({ success: true, configs });
});

router.get('/:configKey', async (req, res) => {
    const configKey = req.params.configKey;
    const configValue = await ConfigService.GetConfig(configKey);

    if (configValue === null) {
        return res.status(404).json({ success: false, message: "Config not found" });
    }

    res.json({ success: true, configKey, configValue });
});

router.post('/', async (req, res) => {
    const { configKey, configValue } = req.body;

    if (!configKey || !configValue) {
        return res.status(400).json({ success: false, message: "configKey and configValue are required" });
    }

    const result = await ConfigService.SetConfig(configKey, configValue);

    if (!result) {
        return res.status(500).json({ success: false, message: "Failed to set config" });
    }

    res.json({ success: true, message: "Config set successfully" });
});

router.post('/start-maintenance', async (req, res) => {
    const result = await ConfigService.StartMaintenanceMode();

    if (!result) {
        return res.status(500).json({ success: false, message: "Failed to start maintenance mode" });
    }

    res.json({ success: true, message: "Maintenance mode started successfully" });
});

router.post('/end-maintenance', async (req, res) => {
    const result = await ConfigService.EndMaintenanceMode();

    if (!result) {
        return res.status(500).json({ success: false, message: "Failed to end maintenance mode" });
    }

    res.json({ success: true, message: "Maintenance mode ended successfully" });
});

export default router;