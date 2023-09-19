import { RequestAuthentication, NextFunction } from 'express'
import JWT from 'jsonwebtoken'
import { AuthFailureError, ForbiddenError, NotFoundError } from '~/core/error.response'
import asyncCatch from '~/helpers/cathAsync'
import { IKeyToken } from '~/models/keytoken.model'
import KeyTokenService from '~/services/keyToken.service'

const HEADER = {
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'refresh-token',
  X_CLIENT_ID: 'x-client-id',
  BEARER: 'Bearer '
}

declare module 'express' {
  export interface RequestAuthentication extends Request {
    user?: JWT.JwtPayload
    keyStore: IKeyToken
    refreshToken: string
  }
}

// interface Request

const authentication = asyncCatch(async (req: RequestAuthentication, res: Response, next: NextFunction) => {
  const clientId = req.headers[HEADER.X_CLIENT_ID]
  const refreshToken = req.headers[HEADER.REFRESH_TOKEN] as string
  const accessToken = req.headers[HEADER.AUTHORIZATION] as string

  const obj = parseJwt(accessToken || refreshToken)
  if (!obj.userId) throw new ForbiddenError('Invalid request')

  const userId = clientId || obj.userId
  if (!userId) throw new ForbiddenError('Invalid request')

  const keyStore = await KeyTokenService.findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Resource not found')

  if (refreshToken) {
    const decodeUser = verifyJwt(refreshToken, keyStore.privateKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')

    req.user = decodeUser
    req.keyStore = keyStore
    req.refreshToken = refreshToken

    return next()
  }

  // 3. get auth token
  if (!accessToken) throw new AuthFailureError('Invalid request')

  // 4.

  const decodeUser = verifyJwt(accessToken, keyStore.publicKey)
  if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')

  req.user = decodeUser
  req.keyStore = keyStore
  return next()
})

const parseJwt = (token: string) => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

const verifyJwt = (token: any, keySecret: JWT.Secret) => JWT.verify(token, keySecret) as JWT.JwtPayload

export { authentication }
