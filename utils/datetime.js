class SysDatetime {
    getFullDate(){
        const date_ob = new Date();

        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();

        const created_date = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        return created_date;
    }
}

module.exports = SysDatetime;