import institutionService from '../services/institutions';

import moment from 'moment';


moment.locale('de');


const fractionDigits = new Map([
    ["seconds", 4],
    ["minutes", 2],
    ["hours", 0],
]);


const formatDuration = async function (rawSeconds: number, precision="minutes"): Promise<string> {
    const format = await institutionService.retrieveSettingValue('working_session', 'decimal_format');
    const roundedSeconds = Math.round(rawSeconds);
    const seconds = Math.abs(roundedSeconds);

    let result = "";
    if (format == 'hours_and_minutes') {
        if (precision == "hours") {
            result = String(Math.round(seconds / 3600));
        }
        else if (precision == "minutes") {
            const minutes = Math.round(seconds / 60);
            result = String(Math.floor(minutes / 60)) + ":" + String(minutes % 60).padStart(2, '0');
        }
        else {
            const minutes = Math.floor(seconds / 60);
            result = String(Math.floor(minutes / 60)) + ":" + String(minutes % 60).padStart(2, '0') + ":" + String(seconds % 60).padStart(2, '0');
        }
    } else {
        const fraction = fractionDigits.get(precision);
        result = (seconds / 3600).toLocaleString('de-DE', { minimumFractionDigits: fraction, maximumFractionDigits: fraction });
    }

    if (roundedSeconds == seconds || result == '0:00' || result == '0,00') {
        return result
    } else {
        return "-" + result
    }
}

const formatDifference = function(dateEarlier: string, dateLater: string, precision="minutes"): Promise<string> {
    return formatDuration(moment(dateLater).diff(moment(dateEarlier)) / 1000, precision);
}

const formatLongDate = function(value: Date): string {
    if (value) {
        return moment(String(value)).format('DD. MMMM YYYY')
    }
    return '';
}

const formatDatetime = function (value: string, format='DD. MMMM YYYY'): string {
    if (value) {
        return moment(String(value)).format(format)
    }
    return '';
}

const formatTime = function (value: Date, precision='minutes'): string {
    let format = "HH:mm";
    if (precision == "seconds") format = "HH:mm:ss";

    if (value) {
        return moment(String(value)).format(format)
    }
    return '';
}

const calendar = function(value: string): string {
    return moment(value).calendar();
}

const timeAgo = function(value: Date): string {
    if (!value) return "";

    const delta = -moment(String(value)).diff() / 1000;

    const days = Math.floor(delta / 86400);
    const hours = Math.floor((delta % 86400) / 3600);
    const minutes = Math.floor((delta % 3600) / 60);
    const seconds = Math.floor(delta % 60);

    let result = "";
    if (days > 0) result += days + "d ";
    if (hours > 0) result += hours + "h ";
    if (minutes > 0) result += minutes + "m ";
    result += seconds + "s";

    return result
}

const sortedJsonString = function(obj: any) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}

export { formatDatetime, formatDifference, formatDuration, formatLongDate, formatTime, timeAgo, calendar, sortedJsonString }
