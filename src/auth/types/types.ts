export interface JwtPayload {
  email: string;
  sub: string;
  iat: number;
  exp?: number;
  permissions: string[];
}

export interface RefreshTokenPayload extends JwtPayload {
  refreshToken: string;
  tokenId: string;
}
