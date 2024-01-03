function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	console.log('getCookie', name, cookieValue); // Log the cookie value
	return cookieValue;
}


function navigateTo(event, route) {
	console.log('navigateTo', route);
	event.preventDefault();

	fetch(route, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	})
	.then(data => {
		console.log('Data:', data);  // Log the data
		if (data.redirect) {
			window.location.href = data.redirect;
		} else if (data.html) {
			document.querySelector('#page-content').innerHTML = data.html;
            loadScriptsFromPage(data.html);
		} else {
			console.error('Unexpected response:', data);
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});

	history.pushState(null, null, route);
}

function loadScriptsFromPage(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const scripts = doc.querySelectorAll('script');

    scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        console.log(script.src);
        document.head.appendChild(newScript);
    });
}

window.addEventListener('popstate', function(event) {
	const currentUrl = window.location.pathname;
	fetch(currentUrl, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	})
	.then(response => response.json())
	.then(data => {
		document.querySelector('#page-content').innerHTML = data.html;
        reloadPageScripts(); // Rechargez les scripts après la mise à jour de #page-content
	});
});


function submitFormWithAjax(event) {
    event.preventDefault();

    const form = event.target;
    const url = form.action;
    const formData = new FormData(form);

	// Convert FormData to JSON
    const data = {};
    for (let pair of formData.entries()) {
        data[pair[0]] = pair[1];
    }

    console.log('Submitting form with URL:', url);  // Log the URL

    const csrfToken = getCookie('csrftoken');
    console.log('CSRF token:', csrfToken);  // Log the CSRF token

    fetch(url, {
        method: 'POST',
        headers: {
			'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
            'Accept': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // Check the content type of the response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            // If it's JSON, parse it
            return response.json();
        } else {
            // If it's not JSON, throw an error
            throw new Error('Server response was not JSON: ' + contentType);
        }
    })
    .then(data => {
		console.log('Data:', data);  // Log the data
		if (data.redirect) {
			// If the response contains a redirect URL, redirect to that URL
			window.location.href = data.redirect;
		} else if (data.html) {
			// If the response contains HTML, display it in #page-content
			document.querySelector('#page-content').innerHTML = data.html;
            reloadPageScripts(); // Rechargez les scripts après la mise à jour de #page-content
		} else {
			// Otherwise, display an error message
			console.error('Unexpected response:', data);
		}
	})
    .catch(error => console.error('Error:', error));
}


function updateHeader() {
    fetch('/header_view/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => response.text())
    .then(data => {
        const header = document.querySelector('header');
        header.innerHTML = data;
    });
}


function signIn() {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    fetch('/sign_in/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({email: email, password: password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
			console.error('Unexpected response:', data);
        }
        // Call updateHeader after successful login
        updateHeader();
    });
}


function signOut() {
    fetch('/sign_out/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            console.error('Unexpected response:', data);
        }
        // Call updateHeader after successful logout
        updateHeader();
    });
}


// Add event listener for all forms to submit them with AJAX
const forms = document.querySelectorAll('form');
forms.forEach(form => form.addEventListener('submit', submitFormWithAjax));

function reloadPageScripts() {
    // Recherchez et exécutez les scripts inclus dans #page-content
    const scripts = document.querySelectorAll('#page-content script');
    scripts.forEach(script => {
        const nouveauScript = document.createElement('script');
        nouveauScript.src = script.src;
        document.head.appendChild(nouveauScript);
    });
}