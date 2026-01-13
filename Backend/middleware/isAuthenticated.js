import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const isAuthenticated = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://dev-po1r5cykjnu8e0ld.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: "http://localhost:5000/api/v3",
  issuer: `https://dev-po1r5cykjnu8e0ld.us.auth0.com/`,
  algorithms: ["RS256"],
});

export default isAuthenticated;
