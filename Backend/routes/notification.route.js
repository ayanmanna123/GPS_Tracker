import express from 'express';
import { 
  sendDelayAlert, 
  scheduleArrivalNotification, 
  sendRouteChangeNotification, 
  sendMaintenanceAlert, 
  checkBusDelays, 
  getActiveNotificationTimers,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
  sendGeneralNotification
} from '../controllers/Notification.controller.js';

const router = express.Router();

// POST routes for sending notifications
router.post('/send-delay-alert', sendDelayAlert);
router.post('/schedule-arrival-notification', scheduleArrivalNotification);
router.post('/send-route-change-notification', sendRouteChangeNotification);
router.post('/send-maintenance-alert', sendMaintenanceAlert);
router.post('/check-bus-delays', checkBusDelays);
router.post('/cancel-scheduled-notification', cancelScheduledNotification);
router.post('/cancel-all-scheduled-notifications', cancelAllScheduledNotifications);
router.post('/send-general-notification', sendGeneralNotification);

// GET routes for notification management
router.get('/active-timers', getActiveNotificationTimers);

export default router;