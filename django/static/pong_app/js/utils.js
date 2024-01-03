function getPaddleID(key) {
	if (key === 'o' || key === 'l') {
		return '1';
	} else if (key === 'w' || key === 's') {
		return '0';
	}

	// TODO tmp for debug
	if (key === 'z' || key === 'x') {
		return '2';
	} else if (key === 'n' || key === 'm') {
		return '3';
	}
}

function getPaddleDirection(key) {
	if (key === 'o' || key === 'w') {
		return 'up';
	} else if (key === 'l' || key === 's') {
		return 'down';
	}

	//  TODO tmp
	if (key === 'z' || key === 'n') {
		return 'up';
	} else if (key === 'x' || key === 'm') {
		return 'down';
	}
}