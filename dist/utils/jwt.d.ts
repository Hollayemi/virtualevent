export interface JwtPayload {
    id: string;
    accountType: 'user' | 'organiser';
}
export declare const signToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const attachCookie: (res: any, token: string) => void;
//# sourceMappingURL=jwt.d.ts.map