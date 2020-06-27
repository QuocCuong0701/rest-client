import {Person} from "../domain/Person";
import {Model} from "../repo/Model";
import {ENDPOINT} from "../util/Constants";
import {METHOD_HTTP} from "../util/Constants";
import {Success} from "../domain/rest/Success";
import {Task} from "../domain/Task";

export class PersonService {
    persons: Person[] = null;

    // Get All People
    getAll(keyword: string = '', status?: string, page: number = 1, limit: number = 10, personId?: number): Person[] {
        let url: string = ENDPOINT.person.list + `?page=${page}&limit=${limit}&keyword=${keyword}${status == null ? '' : `&status=${status}`}${personId == null ? '' : `&personId=${personId}`}`;

        Model.callServer(url, METHOD_HTTP.get, false)
            .done((res: Success) => {
                this.setPersons(res.data as Person[]);
            });
        return this.persons;
    }

    setPersons(persons: Person[]) {
        this.persons = persons;
    }

    // Get A Person
    getPerson(id: number): Person {
        let person: Person = null;
        let url: string = ENDPOINT.person.findById + `${id}`;
        Model.callServer(url, METHOD_HTTP.get, false)
            .done((res: any) => {
                person = res as Person;
            });
        return person;
    }

    // Update A Person
    updatePerson(person: any): any {
        let url = ENDPOINT.person.updatePerson;
        Model.callServer(url, METHOD_HTTP.post, false, person)
            .done((res: any) => person = res as Person)
            .fail((res: any) => person = res as Person);
        return person;
    }
}
