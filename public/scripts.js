document.addEventListener("DOMContentLoaded", function() {
    loadBulletins();
    checkLoginStatus();
});

let currentEditIndex = null;
let dragDropEnabled = false;

function loadBulletins() {
    fetch('/announcements')
        .then(response => response.json())
        .then(bulletins => {
            let column1 = document.getElementById('column-1');
            let column2 = document.getElementById('column-2');
            let loggedIn = localStorage.getItem('loggedIn') === 'true';

            column1.innerHTML = '';
            column2.innerHTML = '';

            bulletins.forEach((bulletin, index) => {
                let bulletinElement = document.createElement('div');
                bulletinElement.className = 'bulletin';

                let titleElement = document.createElement('div');
                titleElement.className = 'bulletin-title';
                titleElement.innerText = bulletin.title;

                let bodyElement = document.createElement('div');
                bodyElement.className = 'bulletin-body';
                bodyElement.innerHTML = bulletin.body.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

                bulletinElement.appendChild(titleElement);
                bulletinElement.appendChild(bodyElement);

                bulletinElement.addEventListener('click', function(event) {
                    if (!event.target.classList.contains('delete-button') && !event.target.classList.contains('edit-button')) {
                        showViewForm(bulletin.title, bulletin.body);
                    }
                });

                if (loggedIn) {
                    let actionsElement = document.createElement('div');
                    actionsElement.className = 'bulletin-actions';

                    let deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-button';
                    deleteButton.innerText = 'Delete';
                    deleteButton.onclick = function(event) {
                        event.stopPropagation();
                        deleteBulletin(index);
                    };

                    let editButton = document.createElement('button');
                    editButton.className = 'edit-button';
                    editButton.innerText = 'Edit';
                    editButton.onclick = function(event) {
                        event.stopPropagation();
                        showEditForm(index);
                    };

                    actionsElement.appendChild(editButton);
                    actionsElement.appendChild(deleteButton);
                    bulletinElement.appendChild(actionsElement);
                }

                if (index % 2 === 0) {
                    column1.appendChild(bulletinElement);
                } else {
                    column2.appendChild(bulletinElement);
                }
            });

            if (loggedIn && dragDropEnabled) {
                initSortable();
            } else {
                destroySortable();
            }
        })
        .catch(error => console.error('Error:', error));
}

function saveBulletins(bulletins) {
    fetch('/announcements', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulletins)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadBulletins();
        } else {
            console.error('Failed to save announcements');
        }
    })
    .catch(error => console.error('Error:', error));
}

function addBulletin() {
    let title = document.getElementById('title').value;
    let body = document.getElementById('body').value;
    if (title && body) {
        fetch('/announcements')
            .then(response => response.json())
            .then(bulletins => {
                bulletins.push({ title: title, body: body });
                saveBulletins(bulletins);
                document.getElementById('title').value = '';
                document.getElementById('body').value = '';
            })
            .catch(error => console.error('Error:', error));
    }
}

function deleteBulletin(index) {
    fetch('/announcements')
        .then(response => response.json())
        .then(bulletins => {
            bulletins.splice(index, 1);
            saveBulletins(bulletins);
        })
        .catch(error => console.error('Error:', error));
}

function showEditForm(index) {
    fetch('/announcements')
        .then(response => response.json())
        .then(bulletins => {
            let bulletin = bulletins[index];

            document.getElementById('editTitle').value = bulletin.title;
            document.getElementById('editBody').value = bulletin.body;
            document.getElementById('editAnnouncementModal').style.display = 'block';
            currentEditIndex = index;
        })
        .catch(error => console.error('Error:', error));
}

function saveEdit() {
    let title = document.getElementById('editTitle').value;
    let body = document.getElementById('editBody').value;
    if (title && body !== null) {
        fetch('/announcements')
            .then(response => response.json())
            .then(bulletins => {
                bulletins[currentEditIndex] = { title: title, body: body };
                saveBulletins(bulletins);
                cancelEdit();
            })
            .catch(error => console.error('Error:', error));
    }
}

function cancelEdit() {
    document.getElementById('editAnnouncementModal').style.display = 'none';
    currentEditIndex = null;
}

function showViewForm(title, body) {
    document.getElementById('viewTitle').innerText = title;
    document.getElementById('viewBody').innerHTML = body.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    document.getElementById('viewAnnouncementModal').style.display = 'block';
}

function closeView() {
    document.getElementById('viewAnnouncementModal').style.display = 'none';
}

function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('loggedIn', 'true');
            checkLoginStatus();
        } else {
            alert('Incorrect username or password');
        }
    })
    .catch(error => console.error('Error:', error));
}

function logout() {
    localStorage.removeItem('loggedIn');
    checkLoginStatus();
}

function checkLoginStatus() {
    let loggedIn = localStorage.getItem('loggedIn') === 'true';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('editForm').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('editAnnouncementModal').style.display = 'none';
    document.getElementById('viewAnnouncementModal').style.display = 'none';
    document.getElementById('loginButton').style.display = loggedIn ? 'none' : 'block';
    loadBulletins();

    if (loggedIn) {
        document.getElementById('editForm').classList.add('logged-in');
    } else {
        document.getElementById('editForm').classList.remove('logged-in');
    }
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginButton').style.display = 'none';
}

function checkEnter(event) {
    if (event.key === "Enter") {
        login();
    }
}

function toggleDragDrop() {
    dragDropEnabled = !dragDropEnabled;
    document.getElementById('toggleDragDropButton').innerText = dragDropEnabled ? "Disable Drag & Drop" : "Enable Drag & Drop";
    loadBulletins();
}

function initSortable() {
    new Sortable(document.getElementById('column-1'), {
        group: 'shared',
        animation: 150,
        onEnd: updateOrder
    });
    new Sortable(document.getElementById('column-2'), {
        group: 'shared',
        animation: 150,
        onEnd: updateOrder
    });
}

function destroySortable() {
    if (document.getElementById('column-1')._sortable) {
        document.getElementById('column-1')._sortable.destroy();
    }
    if (document.getElementById('column-2')._sortable) {
        document.getElementById('column-2')._sortable.destroy();
    }
}

function updateOrder() {
    let column1 = document.getElementById('column-1').children;
    let column2 = document.getElementById('column-2').children;
    let bulletins = [];

    for (let i = 0; i < column1.length; i++) {
        let bulletin = {
            title: column1[i].querySelector('.bulletin-title').innerText,
            body: column1[i].querySelector('.bulletin-body').innerHTML.replace(/<a href="(.*?)" target="_blank">\1<\/a>/g, '$1')
        };
        bulletins.push(bulletin);
    }

    for (let i = 0; i < column2.length; i++) {
        let bulletin = {
            title: column2[i].querySelector('.bulletin-title').innerText,
            body: column2[i].querySelector('.bulletin-body').innerHTML.replace(/<a href="(.*?)" target="_blank">\1<\/a>/g, '$1')
        };
        bulletins.push(bulletin);
    }

    saveBulletins(bulletins);
}
