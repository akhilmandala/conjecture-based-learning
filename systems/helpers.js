
function log_barrier(x, min, max) {
		//return 0;
		return 1 / (x - min) - 1 / (max - x);
}

function poly_barrier(x, min, max, n=8) { 
		// n must be even
		if (x < min) return -Math.pow(min-x, n-1)/n;
		if (x > max) return Math.pow(x-max, n-1)/n;
		return 0;
}

function sat(x, lim, eps = 0.001) {
		if(x >= lim) {
				return x-eps;
		} else if (x <= -lim) {
				return -x+eps;
		}
		return x;
}

export {log_barrier, poly_barrier, sat};