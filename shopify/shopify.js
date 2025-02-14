import dotenv from 'dotenv';
import Shopify from 'shopify-api-node';

dotenv.config();

const API_VERSION = '2024-10';

var SHOPIFY_STORE_NAME = 'bzpg1u-2y.myshopify.com'
var ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

var SHOPIFY_ADMIN_URL = `https://${SHOPIFY_STORE_NAME}/admin/api/${API_VERSION}/graphql.json`;


export const shopify = new Shopify({
  shopName: SHOPIFY_STORE_NAME,
  accessToken: ACCESS_TOKEN,
  apiVersion: API_VERSION
})