import Vue from 'vue';

Vue.filter('fromNow', function (date) {
    return new moment(date).fromNow();
});

Vue.filter('date', function (date) {
    return new moment(date).format('YYYY-MM-DD');
});

Vue.filter('datetime', function (date) {
    return new moment(date).format('YYYY-MM-DD HH:mm');
});

Vue.filter('time', function (date) {
    return new moment(date).format('HH:mm');
});

Vue.filter('boolean', function (boolean) {
    if (boolean) {
        return 'True';
    } else {
        return 'False';
    }
});

Vue.filter('money', function (amount, currency) {
    if (typeof currency == 'undefined') {
        currency = '$';
    }
    amount = parseFloat(amount);

    var positiveAmount = (amount >= 0);

    amount = amount.toFixed(2);

    if (amount.length > 3) {
        amount = amount.replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
    }

    if (positiveAmount) {
        return currency + amount;
    } else {
        return '-' + currency + (amount.substr(1));
    }
});

Vue.filter('duration', function (durationInSeconds) {

    let totalSeconds = durationInSeconds;

    let hours = Math.floor(totalSeconds / 3600);
    let days = Math.floor(hours / 24);
    hours %= 24;

    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    if (days == 0) {
        return hours + ":" + minutes + ":" + seconds;
    } else if (days == 1) {
        return days + " day " + hours + ":" + minutes + ":" + seconds;
    } else {
        return days + " days " + hours + ":" + minutes + ":" + seconds;
    }
});

Vue.filter('getSrc', function (image, width, height) {
    let url = '/thumbnail/random/unknown.jpeg';

    if (image) {
        if (typeof image.id !== 'undefined' && typeof image.hash !== 'undefined') {
            url = '/images/' + image.hash + '-ft=' + width + '+' + height + '.' + image.type;
        } else if (typeof image.model !== 'undefined' && typeof image.modelId !== 'undefined') {
            url = '/thumbnail/' + image.model + '/' + image.modelId + '-s=' + width + 'x' + height + '.jpeg';
        } else if (typeof image == 'string' && image !== '') {
            url = this.image;
        }
    }

    return url;

});