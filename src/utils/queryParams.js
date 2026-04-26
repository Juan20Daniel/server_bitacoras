const normalizeQueryParams = (queryParam) => {
    let value = Number(queryParam)??1;
    if(isNaN(value)) {
        value = 1;
    } else {
        value = value <= 0 ? 1 : value;
    }
    return value;
}

module.exports = {
    normalizeQueryParams
}