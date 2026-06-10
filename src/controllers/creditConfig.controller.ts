import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as creditConfigService from '../services/creditConfig.service';

export const getConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = await creditConfigService.getConfig();
    (res as AppResponse).data({ config }, 'Credit config retrieved');
});

export const upsertConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = await creditConfigService.upsertConfig(req.body);
    (res as AppResponse).data({ config }, 'Credit config updated');
});
