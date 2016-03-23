'use strict';
/**
 * Returns copy of given array with unique values
 * @param {Array} arr
 * @return {Array}
 */
export function unique(arr) {
	return arr.filter(_uniqueHandler);
}
const _uniqueHandler = (val, i, arr) => arr.indexOf(val) === i;

/**
 * Returns normalized URL that can be used as a key in store
 * @param  {String} url
 * @return {String}
 */
export function normalizeUrl(url) {
    return url.replace(/#.*$/, '');
}

export function objToMap(obj) {
	return Object.keys(obj || {}).reduce((out, key) => out.set(key, obj[key]), new Map());
}

export function mapToObj(map) {
	var out = new Map();
	map.forEach((v, k) => out[k] = v);
	return out;
}

export function last(arr) {
	return arr[arr.length - 1];
}

export function has(obj, key) {
	return obj instanceof Map ? obj.has(key) : key in obj
}

export function get(obj, key) {
	return obj instanceof Map ? obj.get(key) : obj[key];
}

export function set(obj, key, value) {
	return obj instanceof Map ? obj.set(key, value) : (obj[key] = value);
}

/**
 * Updates `key` value in given `obj` by creating new instances of intermediate
 * object of deep `key`
 * @param  {Object} obj
 * @param  {String} key
 * @param  {any} value
 * @return {Object}
 */
export function replaceValue(obj, key, value) {
	var parts = key.split('.');
	var lastKey = parts.pop();
	var result = copy(obj);
	var ctx = result;
	parts.forEach(k => {
		var inner = has(ctx, k) ? copy(get(ctx, k)) : {};
		set(ctx, k, inner);
		ctx = inner;
	});
	set(ctx, lastKey, value);
	return result;
}

/**
 * Creates a copy of given object
 * @param  {any} obj
 * @return {any}
 */
export function copy(obj) {
	if (Array.isArray(obj)) {
		return obj.slice();
	}

	if (obj instanceof Map) {
		return new Map(obj);
	}

	if (obj instanceof Set) {
		return new Set(obj);
	}

	if (obj && typeof obj === 'object') {
		return {...obj};
	}

	return obj;
}

/**
 * Returns key from given object that contains given `value`
 * @param  {Object} obj
 * @param  {any} value
 * @return {String}
 */
export function keyForValue(obj, value) {
    return Object.keys(obj).reduce((out, key) => obj[key] === value ? key : out, null);
}

export function error(code, message) {
	var err = new Error(message || code);
	err.code = code;
	return err;
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @src underscore.js
 *
 * @param  {Function} func
 * @param  {Number} wait
 * @param  {Boolean} immediate
 * @return {Function}
 */
export function debounce(func, wait, immediate) {
	var timeout, args, context, timestamp, result;

	var later = function() {
		var last = Date.now() - timestamp;

		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			}
		}
	};

	return function() {
		context = this;
		args = arguments;
		timestamp = Date.now();
		var callNow = immediate && !timeout;
		if (!timeout) timeout = setTimeout(later, wait);
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};
}

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time.
 * @param  {Function} func
 * @param  {Number} wait
 */
export function throttle(func, wait) {
	var context, args, timeout, result;
	var previous = 0;
	var later = function() {
		previous = Date.now();
		timeout = null;
		result = func.apply(context, args);
	};
	return function() {
		var now = Date.now();
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0) {
			clearTimeout(timeout);
			previous = now;
			result = func.apply(context, args);
		} else if (!timeout) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
}


/**
 * Returns string representation for given node path
 * @param {Array} nodePath
 * @type {String}
 */
export function stringifyPath(nodePath) {
	return nodePath.map(c => c[0] + (c[1] > 1 ? '|' + c[1] : '')).join(' / ');
}

/**
 * Returns string representation of given patch JSON
 * @param {Object} patch
 * @type {String}
 */
export function stringifyPatch(patch) {
	var str = stringifyPath(patch.path) + ' {\n' +
		patch.update.map(prop => `  ${prop.name}: ${prop.value};\n`).join('') +
		patch.remove.map(prop => `  /* ${prop.name}: ${prop.value}; */\n`).join('') +
		'}';

	if (patch.action === 'remove') {
		str = '/* remove: ' + stringifyPath(patch.path) + ' */';
	}

	if (patch.hints && patch.hints.length) {
		var hint = patch.hints[patch.hints.length - 1];
		var self = this;

		var before = (hint.before || []).map(function(p) {
			return stringifyPath([p]);
		}).join(' / ');

		var after = (hint.after || []).map(function(p) {
			return stringifyPath([p]);
		}).join(' / ');

		if (before) {
			str = `/** before: ${before} */\n${str}`;
		}

		if (after) {
			str += `\n/** after: ${after} */\n`;
		}
	}

	return str.trim();
}
