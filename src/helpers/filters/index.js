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