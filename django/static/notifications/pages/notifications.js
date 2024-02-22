function renderNotificationsPage() {

	// If the user is not connected
	fetchAPI('/api/isAuthenticated').then(data => {
		if (!data.isAuthenticated) {
			router.navigate('/sign_in/');
			return ;
		}
	});

	// Update the header
	renderHeader();

	// Get the notifications
	fetchAPI('/api/get_notifications').then(data => {

		// Reverse the notifications
		let reversedNotifications = Object.values(data.notifications).reverse();

		// Display the notifications page
		document.getElementById('app').innerHTML = `
			<h1>Notifications</h1>

			<a class="notification-delete-all">
				Delete All
			</a>
		`;

		if (reversedNotifications.length === 0) {
			document.getElementById('app').innerHTML += `
				<p class="no-notification">No notifications.</p>
			`;

		} else {
			for (notification of reversedNotifications) {
				
				let html = `
					<div class="notification">
				`;
			
				if (!notification.read) {
					html += `
						<span class="notification-new">New</span>
					`;
				}
			
				html += `
						<span class="notification-date">${notification.date}</span>
						<span class="notification-message">${notification.message}</span>
			
						<a class="notification-delete" data-notification-id=${notification.id}>
							Delete
						</a>
					</div>
				`;
			
				document.getElementById('app').innerHTML += html;
			}
		};

		// Add event listeners on the delete buttons
		document.querySelectorAll('.notification-delete').forEach(button => {
			button.addEventListener('click', async function(event) {
				event.preventDefault();

				const notificationId = button.getAttribute('data-notification-id');
				fetchAPI(`/api/delete_notification/${notificationId}`).then(data => {
					router.navigate('/notifications/');
					return ;
				});
			});
		});

		// Add an event listener on the delete all button
		document.querySelector('.notification-delete-all').addEventListener('click', async function(event) {
			event.preventDefault();

			fetchAPI('/api/delete_all_notifications').then(data => {
				router.navigate('/notifications/');
				return ;
			});
		});
	});
};