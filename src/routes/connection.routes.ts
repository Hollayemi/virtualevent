import { Router } from 'express';
import * as connectionController from '../controllers/connection.controller';
import { protect, requireAccountType } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { respondConnectionSchema, flatConnectionRequestSchema } from '../helpers/validation.schemas';

const router = Router();

router.use(protect, requireAccountType('user'));

// ─── connection.slice.ts flat API surface ─────────────────────────────────────
// GET  /connections                 -> listConnections
// GET  /connections/received        -> getReceivedConnections
// GET  /connections/sent            -> getSentConnections
// GET  /connections/stats           -> getConnectionsStats
// GET  /connections/pending-count   -> getPendingCount
// POST /connections/request         -> sendFlatConnectionRequest
// POST /connections/:id/accept      -> acceptConnectionFlat
// POST /connections/:id/decline     -> declineConnectionFlat
// POST /connections/:id/cancel      -> cancelConnectionRequest

router.get('/', connectionController.listConnections);
router.get('/received', connectionController.getReceivedConnections);
router.get('/sent', connectionController.getSentConnections);
router.get('/stats', connectionController.getConnectionsStats);
router.get('/pending-count', connectionController.getPendingCount);

router.post(
    '/request',
    validate(flatConnectionRequestSchema),
    connectionController.sendFlatConnectionRequest,
);

router.post('/:connectionId/accept', connectionController.acceptConnectionFlat);
router.post('/:connectionId/decline', connectionController.declineConnectionFlat);
router.post('/:connectionId/cancel', connectionController.cancelConnectionRequest);

// ─── Legacy — kept for backward compatibility with any existing callers ───────
// (event-nested send/list lives in event.routes.ts). This single-action
// respond endpoint is superseded by the accept/decline routes above.
router.patch(
    '/:connectionId/respond',
    validate(respondConnectionSchema),
    connectionController.respondToConnection,
);

export default router;
