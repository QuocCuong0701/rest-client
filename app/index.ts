import 'jquery';
import 'bootstrap';
import {Person, Status} from './domain/Person';
import {PersonService} from './service/PersonService';
import {Task} from "./domain/Task";
import {TaskService} from "./service/TaskService";

export class Index {
    private personService = new PersonService();
    private taskService = new TaskService();

    constructor() {
        // init Service class
        // Call service
        let persons = this.personService.getAll();

        // binding data
        this.bindData(persons);

        // Init event
        this.on_click();
        this.on_change();

        Index.configUI();
    }

    private bindData(persons: Person[]): void {
        let ulEle = $('#persons');
        if (persons.length == 0) {
            ulEle.html('<div> Không có person nào</div>');
        } else {
            let content = '';
            let htmlTask = '';
            persons.forEach((person: Person, index: number) => {
                content += `<tr>
                                <th scope="row">${index + 1}</th>
                                <td>${person.id}</td>
                                <td>${person.name}</td>
                                <td>${person.age}</td>
                                <td>${person.salaryFormat}</td>
                                <td>${person.dobFormat}</td>
                                <td>
                                    ${person.status == Status.ACTIVE ? `<span class="badge badge-success">${person.statusStr}</span>` : `<span class="badge badge-danger">${person.statusStr}</span>`} 
                                </td>
                                <td class="text-center">                          
                                    <button class="btn-transparent btnTaskDetail" data-toggle="tooltip" data-placement="top" id="btn-show-task"  data-id="${person.id}" title="Xem công việc">
                                        <i class="fa fa-tasks" aria-hidden="true"></i>
                                    </button>
                                    <button class="btn-transparent" id="btn-edit-person" title="Sửa" data-toggle="tooltip" data-id="${person.id}" data-placement="top" title="Tooltip on top">
                                        <i class="fa fa-edit" aria-hidden="true"></i>
                                    </button>
                                </td>
                            </tr>`;
            });
            ulEle.html(content);
        }
    }

    private bindTaskData(persons: Person[]): void {
        let content = '';
        persons.forEach((person: Person) => {
            person.tasks.forEach(task => {
                content += `<div class="card">  
                                <div class="card-header" id="heading${task.id}">
                                    <h2 class="mb-0">
                                        <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" 
                                        data-target="#collapse${task.id}" aria-expanded="false" aria-controls="collapse${task.id}">
                                            ${task.title.toUpperCase()}
                                        </button>
                                    </h2>
                                </div>
                                <div id="collapse${task.id}" class="collapse" aria-labelledby="heading${task.id}" data-parent="#accordionExample">
                                    <div class="card-body">
                                        ${task.description}
                                    </div>
                                </div>
                            </div>`;
            });
        });
        $('#accordionExample').html(content);
    }

    // Button Search
    private on_click(): void {
        let self = this;
        let rootElement = $('#persons');
        let task: Task;
        $("#btn-search").on('click', () => {
            let keyword = String($("input[name='keyword']").val());
            this.bindData(this.personService.getAll(keyword));
        });

        // Show Tasks
        rootElement.on('click', '#btn-show-task', function () {
            let personId = Number($(this).attr('data-id'));
            $('#formAddTask').find('input[name="personId"]').val(personId);

            self.bindTaskData(self.personService.getAll(undefined, undefined, undefined, undefined, personId));
            $('#taskModal').modal('show');
        });

        // Edit Information
        let personId: number;
        rootElement.on('click', '#btn-edit-person', function () {
            let person: Person = self.personService.getPerson(Number($(this).attr('data-id')));
            personId = person.id;
            let formElm = $('#formEditPerson');
            formElm.find('input[name="name"]').val(person.name);
            formElm.find('input[name="age"]').val(person.age);
            formElm.find('input[name="salary"]').val(person.salary);

            let date = Index.convertMillisecondToInputDate(person.dob);
            formElm.find('input[name="dob"]').val(date);

            /*let selectElm = formElm.find('select[name="status"]');
            selectElm.val(person.status);
            selectElm.prop('disabled', person.hasTask);*/
            $('#modalEditPerson').modal('show');
        });

        // Update Person
        $('#modalEditPerson').on('click', '#btnUpdatePerson', function () {
            let data = {};
            let formData = $('#formEditPerson').serializeArray();
            $.each(formData, function (i, v) {
                data["" + v.name + ""] = v.value;
            });
            data['id'] = personId;
            data['status'] = $('#formEditPerson').find('select[name="status"]').val();
            self.personService.updatePerson(data as Person);
            self.bindData(self.personService.getAll());
            $('#modalEditPerson').modal('hide');
        });

        // Show Add Task Modal
        $('#taskModal').on('click', '#btnAddTask', function () {
            $('#addTaskModal').modal('show');
        });

        // Add New Task
        $('#addTaskModal').on('click', '#btnSaveTask', function () {
            let formAddTask = $('#formAddTask');
            let personId = Number(formAddTask.find('input[name="personId"]').val());
            let title = String(formAddTask.find('input[name="title"]').val());
            let description = String(formAddTask.find('input[name="description"]').val());

            task = new Task(null, title, description, new PersonService().getPerson(personId), null);
            self.taskService.saveTask(task);

            $('#addTaskModal').modal('hide');
            $('#taskModal').modal('hide');
        });
    }

    // Convert Date
    private static convertMillisecondToInputDate(value: number): string {
        let date = new Date(value);
        return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate()}`;
    }

    // Find By Status
    private on_change(): void {
        $('.filter select[name="status"]').on('change', () => {
            let valOpt: string = String($('.filter select[name="status"] option:checked').val());

            if (valOpt != 'ALL') {
                this.bindData(this.personService.getAll(undefined, valOpt));
            } else {
                this.bindData(this.personService.getAll());
            }
        });
    }

    private static configUI(): void {
        $('[data-toggle="tooltip"]').tooltip();
    }
}

$(document).ready(function () {
    new Index();
});
