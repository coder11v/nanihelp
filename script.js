// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlpEEMLGHOSaknDoLCTehqEQjm8aYxZ64", // Ensure this is the correct and active key
    authDomain: "nanihelpvib.firebaseapp.com",
    projectId: "nanihelpvib",
    storageBucket: "nanihelpvib.appspot.com", // Corrected from 'nanihelpvib.firebasestorage.app' if using default bucket naming
    messagingSenderId: "669651910614",
    appId: "1:669651910614:web:f8a1744f7f7ed3cc05ae77",
    measurementId: "G-RMXGHWP7KC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics(); // Initialize Analytics if you plan to use it

const db = firebase.firestore();
const actionItemsList = document.getElementById('action-items-list');
const addTaskBtn = document.getElementById('add-task-btn');
const taskNameInput = document.getElementById('task-name');
const taskDescriptionInput = document.getElementById('task-description');
const taskAssigneeInput = document.getElementById('task-assignee');
const taskStatusInput = document.getElementById('task-status');

// --- Functions to interact with Firestore ---

// Fetch all tasks from Firestore
const getTasks = async () => {
    try {
        const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTasks(tasks);
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        actionItemsList.innerHTML = '<p style="color: red;">Error loading tasks. Check console for details.</p>';
    }
};

// Add a new task to Firestore
const addTask = async () => {
    const taskName = taskNameInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const assignee = taskAssigneeInput.value.trim();
    const status = taskStatusInput.value;

    if (!taskName) {
        alert("Task name is required!");
        return;
    }

    try {
        await db.collection('tasks').add({
            name: taskName,
            description: description,
            assignee: assignee,
            status: status,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Clear form fields
        taskNameInput.value = '';
        taskDescriptionInput.value = '';
        taskAssigneeInput.value = '';
        taskStatusInput.value = 'To Do'; // Reset to default
        getTasks(); // Refresh the list
    } catch (error) {
        console.error("Error adding task: ", error);
        alert("Failed to add task. See console for details.");
    }
};

// Update task status in Firestore
const updateTaskStatus = async (taskId, newStatus) => {
    try {
        await db.collection('tasks').doc(taskId).update({
            status: newStatus
        });
        getTasks(); // Refresh the list
    } catch (error) {
        console.error("Error updating task status: ", error);
    }
};

// Delete task from Firestore
const deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }
    try {
        await db.collection('tasks').doc(taskId).delete();
        getTasks(); // Refresh the list
    } catch (error) {
        console.error("Error deleting task: ", error);
    }
};

// --- DOM Manipulation ---

// Render tasks to the page
const renderTasks = (tasks) => {
    actionItemsList.innerHTML = ''; // Clear current tasks

    if (tasks.length === 0) {
        actionItemsList.innerHTML = '<p>No tasks yet. Add one above!</p>';
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('action-item');
        taskElement.classList.add(`status-${task.status.toLowerCase().replace(/\s+/g, '-')}`); // e.g., status-to-do
        taskElement.setAttribute('data-id', task.id);

        let assignedTo = task.assignee ? `<p class="meta"><strong>Assignee:</strong> ${task.assignee}</p>` : '';
        let descriptionHTML = task.description ? `<p>${task.description.replace(/\n/g, '<br>')}</p>` : '';


        taskElement.innerHTML = `
            <h3>${task.name}</h3>
            ${descriptionHTML}
            ${assignedTo}
            <p class="meta"><strong>Status:</strong> ${task.status}</p>
            <div class="controls">
                <label for="status-select-${task.id}">Change Status: </label>
                <select id="status-select-${task.id}" class="status-select">
                    <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        // Add event listeners for controls within this task element
        const statusSelect = taskElement.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => {
            updateTaskStatus(task.id, e.target.value);
        });

        const deleteButton = taskElement.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            deleteTask(task.id);
        });

        actionItemsList.appendChild(taskElement);
    });
};

// --- Event Listeners ---

// Add task button
addTaskBtn.addEventListener('click', addTask);

// Initial fetch of tasks when the page loads
// document.addEventListener('DOMContentLoaded', getTasks); // Commented out, will be replaced

// --- Function to Populate Initial Data ---
// IMPORTANT: Call this function manually once from your browser's developer console
// or by temporarily adding a call to it like:
// document.addEventListener('DOMContentLoaded', () => {
//     getTasks();
//     // populateInitialData(); // TEMPORARILY UNCOMMENT AND RUN ONCE
// });
// After running, remove or comment out the call to avoid duplicate data.

const populateInitialData = async () => {
    const initialTasks = [
        {
            name: "Sell Nanu Nani house stuff online",
            description: "This includes bike, tech stuff, Indian outfits, Sono’s surround sound bar, and anything that we don’t need. \nThere is so much stuff! \nYou will take pics and put it on market place and negotiate the sale. \nVIB services will get 50% of the sale.",
            assignee: "Miss Jiya Rani Bajaj",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:00:00")) // Approximate date
        },
        {
            name: "Breggs machine",
            description: "Handle the Breggs machine (sell or decide what to do).",
            assignee: "Miss Jiya Rani Bajaj",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:01:00"))
        },
        {
            name: "Optimize Nanu’s computer and organize his email account",
            description: "Clean up Nanu's computer, improve performance, and organize his email inbox.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:02:00"))
        },
        {
            name: "Nixplay updated and make different playlists, get pics from family",
            description: "Update the Nixplay digital frame, create various photo playlists, and gather pictures from family members.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:03:00"))
        },
        {
            name: "Optimize Nanu’s new TV and surround sound and teach us as well",
            description: "Set up and optimize the new TV and surround sound system. Provide a tutorial on how to use them.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:04:00"))
        },
        {
            name: "Laptop teaching: Set Reminders",
            description: "Teach how to set reminders effectively on the laptop.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:05:00"))
        },
        {
            name: "Laptop teaching: Sync calendars",
            description: "Teach how to sync calendars across devices/accounts on the laptop.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:06:00"))
        },
        {
            name: "Check our WiFi extenders",
            description: "Evaluate the current WiFi extenders, check their performance, and troubleshoot any issues.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:07:00"))
        },
        {
            name: "New phone evaluation (dropped calls)",
            description: "Current phone is an iPhone 12 Max, experiencing a lot of dropped calls. Evaluate the need for a new phone.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:08:00"))
        },
        {
            name: "Google One share with 5",
            description: "Set up or manage Google One sharing with 5 family members.",
            assignee: "",
            status: "To Do",
            createdAt: firebase.firestore.Timestamp.fromDate(new Date("2025-06-01T09:09:00"))
        }
    ];

    // Check if tasks collection is empty before populating
    const tasksSnapshot = await db.collection('tasks').limit(1).get();
    if (tasksSnapshot.empty) {
        console.log("Tasks collection is empty, populating initial data...");
        const batch = db.batch();
        initialTasks.forEach(task => {
            const docRef = db.collection('tasks').doc(); // Automatically generate unique ID
            batch.set(docRef, task);
        });
        try {
            await batch.commit();
            console.log("Initial data populated successfully!");
        } catch (error) {
            console.error("Error populating initial data: ", error);
        }
    } else {
        console.log("Tasks collection is not empty. Skipping initial data population.");
    }
    // Call getTasks() again to refresh the list if data was added
    getTasks();
};

// Modify the DOMContentLoaded event listener to include a call to populateInitialData
// We'll make it check if data exists first.
document.addEventListener('DOMContentLoaded', () => {
    getTasks(); // Fetch existing tasks first
    populateInitialData(); // Then attempt to populate if empty
});
