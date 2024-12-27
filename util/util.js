const metaobjectGIDBase =  `gid://shopify/Metaobject/{id}`;
const customerGIDBase =  `gid://shopify/Customer/{id}`;

export function getGlobalID(type, id) {

    if (typeof id == "string") {
        if (id.startsWith('gid')) {
            return id;
        }
    }

    if (type == 'metaobject') {
        return metaobjectGIDBase.replace('{id}', id);
    } else if (type == 'customer') {
        return customerGIDBase.replace('{id}', id);
    } else {
        console.log('Unknown type provided');
        return null;
    }
}