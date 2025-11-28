const RecetaUtils = {

    generateFolio: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDay()).padStart(2, '0');
        
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        return `RX-${year}${month}${day}-${randomDigits}`;
    },

    generateExpirationDate: (diasValidez = 3) => {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + diasValidez);
        return expirationDate;
    }
};

module.exports = RecetaUtils;