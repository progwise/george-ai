import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!
const KEYCLOAK_URL = process.env.KEYCLOAK_URL!

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
})

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(err, key?.getPublicKey())
  })
}

interface DecodedToken {
  sub: string
  email: string
}

export const decodeToken = (token: string): Promise<DecodedToken> => {
  return new Promise((resolve) => {
    jwt.verify(token, getKey, { issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}` }, (decoded) => {
      const payload = decoded as jwt.JwtPayload
      if (payload && typeof payload === 'object' && 'sub' in payload && 'email' in payload) {
        resolve({
          sub: payload.sub as string,
          email: payload.email as string,
        })
      }
    })
  })
}
