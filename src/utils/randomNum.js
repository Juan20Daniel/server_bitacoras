const randomNum = () => {
    const randomNum = 
        `${Math.floor(Math.random() * 100)}`+
        `${Math.floor(Math.random() * 100)}`+
        `${Math.floor(Math.random() * 100)}`+
        `${Math.floor(Math.random() * 100)}`
    return randomNum;
}
   

module.exports = {randomNum}