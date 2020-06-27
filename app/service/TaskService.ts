import {Task} from "../domain/Task";
import {ENDPOINT, METHOD_HTTP} from "../util/Constants";
import {Model} from "../repo/Model";

export class TaskService {

    // Get Tasks By Person Id
    getTasksByPersonId(personId: number): any {
        let tasks: Task[];
        let url = ENDPOINT.task.findTasksByPersonId + `${personId}`;
        Model.callServer(url, METHOD_HTTP.get, false)
            .done((res: any) => {
                tasks = res as Task[];
            });
        return tasks;
    }

    // Save A New Task
    saveTask(task: any): any {
        let url: string = ENDPOINT.task.saveTask + "?lang=vi";
        Model.callServer(url, METHOD_HTTP.post,false , task)
            .fail((res: any) => {
                task = res as Task;
            })
            .done((res: any) => {
                task = res as Task;
            });
        return task;
    }
}