import {Task} from "../domain/Task";
import {ENDPOINT, METHOD_HTTP} from "../util/Constants";
import {Model} from "../repo/Model";

export class TaskService {

    // FInd Tasks By Person Id
    findTaskByPersonId(personId: number): any {
        let tasks: Task[];
        let url = ENDPOINT.task.findTasksByPersonId + `${personId}`;
        Model.callServer(url, METHOD_HTTP.get, false)
            .done((res: any) => {
                tasks = res as Task[];
            });
        return tasks;
    }

    // Save A New Task
    saveTask(task: Task): Task {
        let url: string = ENDPOINT.task.saveTask;
        Model.callServer(url, METHOD_HTTP.post,false , task)
            .done((res: any) => {
                task = res as Task;
            });
        return task;
    }
}