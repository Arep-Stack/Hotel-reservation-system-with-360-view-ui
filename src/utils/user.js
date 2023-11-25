import CryptoJS from 'crypto-js';

function postUser(user) {
  const encrypted = CryptoJS.TripleDES.encrypt(
    JSON.stringify(user),
    'process.env.REACT_APP_CJS_SP',
  );

  const date = new Date();
  date.setTime(date.getTime() + 1 * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = '__USER__DATA__=' + encrypted + ';' + expires + ';path=/';
}

function getUser() {
  const cookieName = '__USER__DATA__=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      const encrypted = cookie.substring(cookieName.length, cookie.length);
      return CryptoJS.TripleDES.decrypt(
        encrypted,
        'process.env.REACT_APP_CJS_SP',
      ).toString(CryptoJS.enc.Utf8);
    }
  }

  return null;
}

function logOut() {
  document.cookie = '__USER__DATA__=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export { getUser, postUser, logOut };
