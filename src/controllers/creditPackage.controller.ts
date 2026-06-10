import { Request, Response } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import * as creditPackageService from '../services/creditPackage.service';

// ─── Public ───────────────────────────────────────────────────────────────────

export const getActivePackages = asyncHandler(async (req: Request, res: Response) => {
    const packages = await creditPackageService.getActivePackages();
    (res as AppResponse).data({ packages }, 'Credit packages retrieved');
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllPackages = asyncHandler(async (req: Request, res: Response) => {
    const packages = await creditPackageService.getAllPackages();
    (res as AppResponse).data({ packages }, 'All credit packages retrieved');
});

export const createPackage = asyncHandler(async (req: Request, res: Response) => {
    const pkg = await creditPackageService.createPackage(req.body);
    (res as AppResponse).data({ package: pkg }, 'Credit package created', 201);
});

export const updatePackage = asyncHandler(async (req: Request, res: Response) => {
    const pkg = await creditPackageService.updatePackage(req.params.id, req.body);
    (res as AppResponse).data({ package: pkg }, 'Credit package updated');
});

export const deactivatePackage = asyncHandler(async (req: Request, res: Response) => {
    const pkg = await creditPackageService.deactivatePackage(req.params.id);
    (res as AppResponse).data({ package: pkg }, 'Credit package deactivated');
});
