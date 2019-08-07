import Vue from 'vue';

Vue.mixin({
    methods: {
        slugify(string) {
            const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
            const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
            const p = new RegExp(a.split('').join('|'), 'g');
            return string.toString().toLowerCase().trim()
                .replace(/\s+/g, '-')
                .replace(p, c => b.charAt(a.indexOf(c)))
                .replace(/&/g, '-and-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '');
        },
        camelCase(string) {
            return string.toString().trim()
                .replace(/\s(.)/g, function ($1) {
                    return $1.toUpperCase();
                })
                .replace(/\s/g, '')
                .replace(/^(.)/, function ($1) {
                    return $1.toLowerCase();
                });
        },
        snakeCase(string) {
            return string.toString().toLowerCase().trim().replace(/\s+/g, '_');
        },
        ucfirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        decodeBase64(string) {
            var e = {}, i, b = 0, c, x, l = 0, a, r = '', w = String.fromCharCode, L = string.length;
            var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            for (i = 0; i < 64; i++) {
                e[A.charAt(i)] = i;
            }
            for (x = 0; x < L; x++) {
                c = e[string.charAt(x)];
                b = (b << 6) + c;
                l += 6;
                while (l >= 8) {
                    ((a = (b >>> (l -= 8)) & 0xff) || (x < (L - 2))) && (r += w(a));
                }
            }
            return r;
        },
        isEmpty(obj) {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        },
        getFileIcon(file) {
            if (file.mime === 'application/pdf') {
                return 'mdi-file-pdf';
            } else if (file.mime.substring(0, 5) === 'image') {
                return 'mdi-file-image';
            } else if (file.mime.substring(0, 5) === 'video') {
                return 'mdi-file-video';
            } else {
                return 'mdi-file-document';
            }
        },
        humanFileSize(size, si) {
            let thresh = si ? 1000 : 1024;
            let i = Math.floor(Math.log(size) / Math.log(thresh));
            return (size / Math.pow(thresh, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },
    }
});