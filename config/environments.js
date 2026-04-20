
export const environments = {
    staging: {
        baseURl: 'https://food-stg.yassir.io',
    },
    preprod: {
        baseURl: 'https://food-preprod.yassir.io',
    },

};

export function getBaseUrl() {
    const env = __ENV.TARGET_ENV || 'test';
    return environments[env].baseURl;
}