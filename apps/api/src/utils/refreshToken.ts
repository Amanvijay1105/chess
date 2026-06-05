import crypto from "crypto"
 export  function generateTokenString(){
  return crypto.randomBytes(64).toString('hex')
}

export function hashToken(token:string): Promise<string> {
   const salt = 'your-secret-salt';
   return new Promise((resolve, reject) => {
     crypto.scrypt(token, salt, 64, (err, derivedKey) => {
       if (err) reject(err);
       resolve(derivedKey.toString('hex'));
     });
   });
}
