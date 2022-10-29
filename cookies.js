export function bake_cookie(name, value) {
    var cookie = [name, '=', JSON.stringify(value), /*'; domain=.', window.location.host.toString(), */'; path=/;'].join('');
   // console.log(JSON.stringify(value))
    document.cookie = cookie;
  }

export function eat_cookie(name) {
    var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
    result && (result = JSON.parse(result[1]));
    return result;
   }

export function deleteCookie(name){
    document.cookie = name + "=;path=/; expires = 0"
}