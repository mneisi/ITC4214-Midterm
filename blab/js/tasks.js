// Helper function for priority classes (add this)
function getPriorityClass(priority) {
    return {
        'High': 'danger',
        'Medium': 'warning',
        'Low': 'success'
    }[priority] || 'secondary';
}

// Task.html
$(document).ready(function() {
    let statuses = JSON.parse(localStorage.getItem('statuses')) || ['To Do', 'In Progress', 'Done'];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentEditId = null;

    // Initialize board
    function initBoard() {
        $('#taskBoard').empty();
        statuses.forEach(status => createStatusColumn(status));
        loadTasks();
        initSortable();
        updateStatusDropdown();
    }

    function createStatusColumn(status) {
        const column = $(`
            <div class="status-column">
                <div class="status-header">
                    <span>${status}</span>
                    <span class="delete-status-btn" data-status="${status}">×</span>
                </div>
                <div class="task-list" data-status="${status}"></div>
            </div>
        `);
        $('#taskBoard').append(column);
    }

    function initSortable() {
        // Safely destroy existing sortables
        $('.task-list').each(function() {
            if ($(this).data('ui-sortable')) {
                $(this).sortable('destroy');
            }
        });

        // Initialize new sortable instances
        $('.task-list').sortable({
            connectWith: '.task-list',
            placeholder: 'sortable-placeholder',
            tolerance: 'pointer',
            cursor: 'move',
            opacity: 0.8,
            start: function(e, ui) {
                ui.item.addClass('dragging');
            },
            stop: function(e, ui) {
                ui.item.removeClass('dragging');
            },
            receive: function(event, ui) {
                const newStatus = $(this).data('status');
                const taskId = ui.item.data('id');
                
                // Update data model
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newStatus;
                    saveData();
                }
                
                // Update DOM attributes
                ui.item.attr('data-status', newStatus);
                $(this).sortable('refresh');
            }
        }).disableSelection();
    }


    function loadTasks() {
        tasks.forEach(task => {
            $(`.task-list[data-status="${task.status}"]`).append(createTaskCard(task));
        });
        updateColumnCounts();
    }

    function createTaskCard(task) {
        const card = $(`
            <div class="task-card" data-id="${task.id}" data-status="${task.status}">
                <h6>${task.name}</h6>
                ${task.description ? `<p class="small">${task.description}</p>` : ''}
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-${getPriorityClass(task.priority)}">${task.priority}</span>
                    <small>${task.dueDate}</small>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-warning edit-btn">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn">Delete</button>
                </div>
            </div>
        `);
        card.data('status', task.status);
        return card;
    }

    function getPriorityClass(priority) {
        return {
            'High': 'danger',
            'Medium': 'warning',
            'Low': 'success'
        }[priority];
    }

    // Task Form Handling
    $('#taskForm').submit(function(e) {
        e.preventDefault();
        const task = {
            id: currentEditId || Date.now(),
            name: $('#taskName').val().trim(),
            description: $('#taskDescription').val().trim(),
            dueDate: $('#dueDate').val(),
            priority: $('#priority').val(),
            status: $('#taskStatus').val()
        };

        if (!validateTask(task)) return;

        if (currentEditId) {
            updateTask(task);
        } else {
            addTask(task);
        }

        saveData();
        $('#taskModal').modal('hide');
        resetForm();
    });

    function validateTask(task) {
        if (!task.name || !task.dueDate || !task.status) {
            alert('Please fill all required fields');
            return false;
        }
        return true;
    }

    function addTask(task) {
        tasks.push(task);
        $(`.task-list[data-status="${task.status}"]`).append(createTaskCard(task));
    }

    function updateTask(updatedTask) {
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        const oldStatus = tasks[index].status;
        tasks[index] = updatedTask;

        if (oldStatus !== updatedTask.status) {
            $(`.task-card[data-id="${updatedTask.id}"]`).remove();
            $(`.task-list[data-status="${updatedTask.status}"]`).append(createTaskCard(updatedTask));
        } else {
            $(`.task-card[data-id="${updatedTask.id}"]`).replaceWith(createTaskCard(updatedTask));
        }
    }

    // Status Management
    $('#addStatusBtn').click(() => $('#statusModal').modal('show'));

    $('#statusForm').submit(function(e) {
        e.preventDefault();
        const newStatus = $('#statusName').val().trim();
        
        if (!newStatus) {
            alert('Please enter a status name');
            return;
        }
        
        if (statuses.includes(newStatus)) {
            alert('Status already exists');
            return;
        }

        statuses.push(newStatus);
        saveData();
        initBoard();
        $('#statusModal').modal('hide');
        $('#statusName').val('');
    });

    $(document).on('click', '.delete-status-btn', function() {
        const status = $(this).data('status');
        if (statuses.length <= 1) {
            alert('You must have at least one status');
            return;
        }

        if (!confirm(`Delete "${status}" status? All tasks will be moved to "${statuses[0]}"`)) return;

        // Move tasks to first status
        tasks = tasks.map(task => {
            if (task.status === status) task.status = statuses[0];
            return task;
        });

        statuses = statuses.filter(s => s !== status);
        saveData();
        initBoard();
    });

    // Edit/Delete Tasks
    $(document).on('click', '.edit-btn', function() {
        const taskId = $(this).closest('.task-card').data('id');
        const task = tasks.find(t => t.id === taskId);
        
        $('#taskName').val(task.name);
        $('#taskDescription').val(task.description);
        $('#dueDate').val(task.dueDate);
        $('#priority').val(task.priority);
        $('#taskStatus').val(task.status);
        currentEditId = taskId;
        $('#taskModal').modal('show');
    });

    $(document).on('click', '.delete-btn', function() {
        const taskId = $(this).closest('.task-card').data('id');
        tasks = tasks.filter(t => t.id !== taskId);
        $(`.task-card[data-id="${taskId}"]`).remove();
        saveData();
    });

    // Helpers
    function updateStatusDropdown() {
        $('#taskStatus').empty();
        statuses.forEach(status => {
            $('#taskStatus').append($('<option>', {
                value: status,
                text: status
            }));
        });
    }

    function updateColumnCounts() {
        statuses.forEach(status => {
            const count = $(`.task-list[data-status="${status}"] .task-card`).length;
            $(`.status-column:contains('${status}') .count`).text(count);
        });
    }

    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('statuses', JSON.stringify(statuses));
        updateColumnCounts();
        $('.task-list').sortable('refresh');
        
        // Update activity feed on index.html
        if (typeof displayRecentTasks === 'function') {
            displayRecentTasks();
        }
    }

    function resetForm() {
        $('#taskForm')[0].reset();
        currentEditId = null;
    }

    // Initialization
    initBoard();
});