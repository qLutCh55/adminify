require('./authorization');
// require('./error-handling');
require('./filters');
require('./mixins');

import GlobalEvent from './event/index';
window.AdminifyEvent = new GlobalEvent();
