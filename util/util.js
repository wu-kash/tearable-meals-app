const GIDBase =  `gid://shopify/{type}/{id}`;

export function getGlobalID(type, id) {

    if (typeof id == "string") {
        if (id.startsWith('gid')) {
            return id;
        }
    }

    return GIDBase.replace('{id}', id).replace('{type}', toTitleCase(type));
}

export function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}
  
export function getMetaObjectUrl(gid) {

    

}