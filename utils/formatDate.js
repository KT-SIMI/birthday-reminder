exports.generateFormatDate = (date) => {
     const dateTime = new Date(Date.parse(date))
    
        const day = dateTime.getDate()
        const month = dateTime.toLocaleString('default', { month: 'long' });
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    
        const ordinalSuffix = (n) => {
          const s = ["th", "st", "nd", "rd"],
            v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
    
        const formattedDate = `${ordinalSuffix(day)} of ${month}, ${year} at ${hours}:${minutes}`;

        return formattedDate
}