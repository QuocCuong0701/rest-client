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

    //region Binding People Data
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
    //endregion

    //region Binding Tasks Data
    private bindTaskData(tasks: Task[]): void {
        let content = '';
        if (jQuery.isEmptyObject(tasks)) {
            content += `<h3><i>Không có công việc nào.</i></h3>`;
        } else {
            tasks.forEach((task: Task) => {
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
        }

        $('#accordionExample').html(content);
    }
    //endregion

    // Button Search
    private on_click(): void {
        let self = this;
        let rootElement = $('#persons');
        let task: Task;
        let tasks: Task[];

        //region Search People
        $("#btn-search").on('click', () => {
            let keyword = String($("input[name='keyword']").val());
            this.bindData(this.personService.getAll(keyword));
        });
        //endregion

        //region Show Tasks
        rootElement.on('click', '#btn-show-task', function () {
            $('.tagError').remove();
            let personId = Number($(this).attr('data-id'));
            $('#formAddTask').find('input[name="personId"]').val(personId);
            tasks = self.taskService.getTasksByPersonId(personId);
            self.bindTaskData(tasks);
            $('#taskModal').modal('show');
        });
        //endregion

        //region Edit Information
        let personId: number;
        rootElement.on('click', '#btn-edit-person', function () {
            $('.tagError').remove();
            let person: Person = self.personService.getPerson(Number($(this).attr('data-id')));
            personId = person.id;
            let formElm = $('#formEditPerson');
            formElm.find('input[name="name"]').val(person.name);
            formElm.find('input[name="age"]').val(person.age);
            formElm.find('input[name="salary"]').val(person.salary);

            let date = Index.convertMillisecondToInputDate(person.dob);
            formElm.find('input[name="dob"]').val(date);

            let selectElm = formElm.find('select[name="status"]');
            selectElm.val(person.status);
            if (person.status == "ACTIVE" && person.hasTask == true) {
                selectElm.prop('disabled', true);
            } else {
                selectElm.prop('disabled', false);
            }
            $('#modalEditPerson').modal('show');
        });
        //endregion

        //region Update Person
        $('#addTask').keypress(function (e) {
            let formEditPerson = $('#formEditPerson');
            if (e.which == 13) {
                e.preventDefault();
            }
            let data = {};
            let formData = formEditPerson.serializeArray();
            $.each(formData, function (i, v) {
                data["" + v.name + ""] = v.value;
            });
            data['id'] = personId;
            data['status'] = formEditPerson.find('select[name="status"]').val();

            let person = self.personService.updatePerson(data as Person);

            if (!jQuery.isEmptyObject(person.responseJSON)) {
                $('.tagError').remove();
                // @ts-ignore
                $.each(person.responseJSON.errors, function (i, val) {
                    formEditPerson.find('input[name="' + i.toString() + '"]')
                        .after($("<p class='tagError' style='color: red;'></p>").attr('id', 'tagError-' + i.toString()).text(val));
                });
            } else {
                self.bindData(self.personService.getAll());
                $('#modalEditPerson').modal('hide');
            }

        });
        $('#modalEditPerson').on('click', '#btnUpdatePerson', function () {
            $('#addTask').keypress();
        });

        /*$('#modalEditPerson').on('click', '#btnUpdatePerson', function () {
            let data = {};
            let formData = $('#formEditPerson').serializeArray();
            $.each(formData, function (i, v) {
                data["" + v.name + ""] = v.value;
            });
            data['id'] = personId;
            data['status']=$('#formEditPerson').find('select[name="status"]').val();
            self.personService.updatePerson(data as Person);
            self.bindData(self.personService.getAll());
            $('#modalEditPerson').modal('hide');
        });*/
        //endregion

        //region Add New Task
        $('#taskModal').on('click', '#btnAddTask', function () {
            let formAddTask = $('#formAddTask');
            let personId = Number(formAddTask.find('input[name="personId"]').val());
            let title = String(formAddTask.find('input[name="title"]').val());
            let description = String(formAddTask.find('input[name="description"]').val());

            task = new Task(null, title, description, new Person(personId), null);
            task = self.taskService.saveTask(task);

            // @ts-ignore
            if (!jQuery.isEmptyObject(task.responseJSON)) {
                $('.tagError').remove();
                // @ts-ignore
                $.each(task.responseJSON.errors, function (i, val) {
                    formAddTask.find('input[name="' + i.toString() + '"]')
                        .after($("<p class='tagError' style='color: red;'></p>").attr('id', 'tagError-' + i.toString()).text(val));
                });
            } else {
                tasks.push(task);
                formAddTask.trigger("reset");
                self.bindTaskData(tasks);
            }
        });
        //endregion
    }


    //region Convert Date
    private static convertMillisecondToInputDate(value: number): string {
        let date = new Date(value);
        return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
        //return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate()}`;
    }

    //endregion

    //region Find By Status
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

    //endregion

    private static configUI(): void {
        $('[data-toggle="tooltip"]').tooltip();
    }
}

$(document).ready(function () {
    new Index();
});
